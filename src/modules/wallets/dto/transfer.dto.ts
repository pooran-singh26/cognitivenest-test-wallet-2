import { IsMongoId, IsNumber, IsPositive } from 'class-validator';

export class TransferDto {
  @IsMongoId()
  fromUserId: string;

  @IsMongoId()
  toUserId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
