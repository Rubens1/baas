import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import { Checkout, CheckoutMethod, CheckoutStatus } from '../entities/Checkout.js';
import { Fee } from '../entities/Fee.js';
import { Transaction, TransactionStatus, TransactionType } from '../entities/Transaction.js';
import { Wallet } from '../entities/Wallet.js';
import { CreateCheckoutDto } from './dto/create-checkout.dto.js';
import { SimulatePaymentDto } from './dto/simulate-payment.dto.js';

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
@Controller('checkouts')
export class CheckoutsController {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkouts: Repository<Checkout>,
    @InjectRepository(Fee)
    private readonly fees: Repository<Fee>,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  async create(
    @CurrentMerchant() merchantId: string,
    @Body() body: CreateCheckoutDto,
  ) {
    const installments = body.method === CheckoutMethod.CARD ? (body.installments ?? 1) : 1;
    const fee = await this.getFee(body.method, installments, body.brand);
    const externalReference = `baas-${randomUUID()}`;

    return this.dataSource.transaction(async (manager) => {
      const checkoutRepository = manager.getRepository(Checkout);
      const transactionRepository = manager.getRepository(Transaction);
      const walletRepository = manager.getRepository(Wallet);
      const wallet = await walletRepository.findOne({ where: { merchantId } });
      if (!wallet) throw new NotFoundException('Carteira não encontrada.');

      const checkout = await checkoutRepository.save(
        checkoutRepository.create({
          merchantId,
          externalReference,
          method: body.method,
          status: CheckoutStatus.PENDING,
          amount: body.amount,
          feePercent: fee.feePercent,
          installments: body.method === CheckoutMethod.CARD ? installments : null,
          qrCodeBase64: null,
          emv: body.method === CheckoutMethod.PIX ? `BAAS-LOCAL:${externalReference}` : null,
          metadata: { mode: 'LOCAL_SIMULATION' },
        }),
      );
      await transactionRepository.save(
        transactionRepository.create({
          id: randomUUID(),
          walletId: wallet.id,
          type: body.method === CheckoutMethod.PIX ? TransactionType.PIX_IN : TransactionType.CARD_IN,
          status: TransactionStatus.PENDING,
          amount: body.amount,
          fee: 0,
          externalReference,
          metadata: { checkoutId: checkout.id },
        }),
      );
      return checkout;
    });
  }

  @Get()
  async list(
    @CurrentMerchant() merchantId: string,
    @Query('status') status?: CheckoutStatus,
  ) {
    return this.checkouts.find({
      where: { merchantId, ...(status ? { status } : {}) },
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  async get(@CurrentMerchant() merchantId: string, @Param('id') id: string) {
    const checkout = await this.checkouts.findOne({ where: { id, merchantId } });
    if (!checkout) throw new NotFoundException('Checkout não encontrado.');
    return checkout;
  }

  @Patch(':id/simulate-payment')
  async simulatePayment(
    @CurrentMerchant() merchantId: string,
    @Param('id') id: string,
    @Body() body: SimulatePaymentDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const checkoutRepository = manager.getRepository(Checkout);
      const walletRepository = manager.getRepository(Wallet);
      const transactionRepository = manager.getRepository(Transaction);
      const checkout = await checkoutRepository.findOne({
        where: { id, merchantId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!checkout) throw new NotFoundException('Checkout não encontrado.');
      if (checkout.status !== CheckoutStatus.PENDING) {
        if (checkout.status === body.status) return checkout;
        throw new ConflictException('O checkout já recebeu um resultado definitivo.');
      }

      const transaction = await transactionRepository.findOne({
        where: { externalReference: checkout.externalReference },
      });
      if (!transaction) throw new NotFoundException('Transação do checkout não encontrada.');

      if (body.status === CheckoutStatus.APPROVED) {
        const wallet = await walletRepository.findOne({
          where: { merchantId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!wallet) throw new NotFoundException('Carteira não encontrada.');
        const feeAmount = Math.round(checkout.amount * (checkout.feePercent ?? 0)) / 100;
        wallet.balanceAvailable = Number(wallet.balanceAvailable) + checkout.amount - feeAmount;
        transaction.status = TransactionStatus.COMPLETED;
        transaction.fee = feeAmount;
        await walletRepository.save(wallet);
      } else {
        transaction.status = TransactionStatus.FAILED;
      }

      checkout.status = body.status;
      await transactionRepository.save(transaction);
      return checkoutRepository.save(checkout);
    });
  }

  private async getFee(method: CheckoutMethod, installments: number, brand?: string): Promise<Fee> {
    const exactFee = brand
      ? await this.fees.findOne({
          where: { method, brand: brand.toUpperCase(), installments },
        })
      : null;
    const fee =
      exactFee ??
      (await this.fees.findOne({ where: { method, brand: 'ALL', installments } }));
    if (!fee) {
      throw new BadRequestException(`Não há taxa configurada para ${method} em ${installments} parcela(s).`);
    }
    return fee;
  }
}
