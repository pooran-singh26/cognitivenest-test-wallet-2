import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { AddBalanceDto } from '../dto/add-balance.dto';
import { TransferDto } from '../dto/transfer.dto';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async addBalance(userId: string, dto: AddBalanceDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { balance: dto.amount } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async transfer(dto: TransferDto): Promise<{ transactionId: string }> {
    if (dto.fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot transfer to same user');
    }

    const session = await this.connection.startSession();

    try {
      let transactionId: string | null = null;
      await session.withTransaction(async () => {
        const senderId = new Types.ObjectId(dto.fromUserId);
        const receiverId = new Types.ObjectId(dto.toUserId);

        const debit = await this.userModel.findOneAndUpdate(
          { _id: senderId, balance: { $gte: dto.amount } },
          { $inc: { balance: -dto.amount } },
          { new: true, session },
        );

        if (!debit) {
          throw new BadRequestException('Insufficient balance or sender not found');
        }

        const credit = await this.userModel.findByIdAndUpdate(
          receiverId,
          { $inc: { balance: dto.amount } },
          { new: true, session },
        );

        if (!credit) {
          throw new NotFoundException('Receiver not found');
        }

        const transaction = await this.transactionModel.create(
          [
            {
              fromUserId: senderId,
              toUserId: receiverId,
              amount: dto.amount,
            },
          ],
          { session },
        );

        transactionId = transaction[0]._id.toString();
      });

      return { transactionId: transactionId as string };
    } finally {
      await session.endSession();
    }
  }
}
