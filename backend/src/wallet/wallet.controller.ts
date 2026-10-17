import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import { WalletService } from './wallet.service.js';

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
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentMerchant() merchantId: string) {
    return this.walletService.getWallet(merchantId);
  }

  @Get('summary')
  getSummary(@CurrentMerchant() merchantId: string) {
    return this.walletService.getSummary(merchantId);
  }

  @Get('transactions')
  getTransactions(
    @CurrentMerchant() merchantId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    const pageSize = limit === undefined ? 100 : Number(limit);
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000) {
      throw new BadRequestException('limit deve ser um inteiro entre 1 e 1000.');
    }

    return this.walletService.getTransactions(merchantId, {
      status: status?.toUpperCase(),
      type: type?.toUpperCase(),
      limit: pageSize,
    });
  }
}
