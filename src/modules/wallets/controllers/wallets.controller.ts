import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { AddBalanceDto } from '../dto/add-balance.dto';
import { TransferDto } from '../dto/transfer.dto';
import { WalletsService } from '../services/wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post(':userId/add-balance')
  @HttpCode(HttpStatus.OK)
  async addBalance(@Param('userId') userId: string, @Body() dto: AddBalanceDto) {
    return this.walletsService.addBalance(userId, dto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(@Body() dto: TransferDto) {
    return this.walletsService.transfer(dto);
  }
}
