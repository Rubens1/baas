import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard.js';
import { CheckoutMethod } from '../entities/Checkout.js';
import { Fee } from '../entities/Fee.js';

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
@Controller('fees')
export class FeesController {
  constructor(
    @InjectRepository(Fee)
    private readonly fees: Repository<Fee>,
  ) {}

  @Get()
  async getFees(
    @Query('method') method: CheckoutMethod = CheckoutMethod.CARD,
    @Query('brand') brand?: string,
  ) {
    return this.fees.find({
      where: [
        { method, brand: brand?.toUpperCase() ?? 'ALL' },
        ...(brand ? [{ method, brand: 'ALL' }] : []),
      ],
      order: { installments: 'ASC' },
    });
  }
}
