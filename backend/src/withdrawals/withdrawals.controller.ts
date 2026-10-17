import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import { Transaction, TransactionStatus, TransactionType } from '../entities/Transaction.js';
import { Wallet } from '../entities/Wallet.js';
import { Withdrawal } from '../entities/Withdrawal.js';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto.js';

@UseGuards(AuthGuard)
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Bearer token ausente, inválido ou expirado.',
  schema: {
    example: {
      message: 'Bearer token é obrigatório.',
      error: 'Unauthorized',
      statusCode: 401,
    },
  },
})
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly dataSource: DataSource) {}

  @Post()
  async create(
    @CurrentMerchant() merchantId: string,
    @Body() body: CreateWithdrawalDto,
  ) {
    if (Object.keys(body.destinationData).length === 0) {
      throw new BadRequestException('Informe os dados de destino do saque.');
    }

    return this.dataSource.transaction(async (manager) => {
      const walletRepository = manager.getRepository(Wallet);
      const withdrawalRepository = manager.getRepository(Withdrawal);
      const transactionRepository = manager.getRepository(Transaction);
      const wallet = await walletRepository.findOne({
        where: { merchantId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Carteira não encontrada.');
      if (Number(wallet.balanceAvailable) < body.amount) {
        throw new BadRequestException('Saldo disponível insuficiente.');
      }

      wallet.balanceAvailable = Number(wallet.balanceAvailable) - body.amount;
      const withdrawal = await withdrawalRepository.save(
        withdrawalRepository.create({
          merchantId,
          amount: body.amount,
          destinationType: body.destinationType,
          destinationData: body.destinationData,
          status: 'COMPLETED',
          metadata: { mode: 'LOCAL_TRANSFER' },
        }),
      );
      await transactionRepository.save(
        transactionRepository.create({
          id: randomUUID(),
          walletId: wallet.id,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.COMPLETED,
          amount: body.amount,
          fee: 0,
          externalReference: `withdrawal-${withdrawal.id}`,
          metadata: { withdrawalId: withdrawal.id },
        }),
      );
      await walletRepository.save(wallet);
      return withdrawal;
    });
  }

  @Get()
  list(@CurrentMerchant() merchantId: string) {
    return this.dataSource.getRepository(Withdrawal).find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  @Get(':id')
  async getStatus(@CurrentMerchant() merchantId: string, @Param('id') id: string) {
    const withdrawal = await this.dataSource.getRepository(Withdrawal).findOne({
      where: { id, merchantId },
    });
    if (!withdrawal) throw new NotFoundException('Saque não encontrado.');
    return withdrawal;
  }
}
