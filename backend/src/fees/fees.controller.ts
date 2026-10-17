import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard.js';
import { CheckoutMethod } from '../entities/Checkout.js';
import { Fee } from '../entities/Fee.js';
import { CreateFeeDto } from './dto/create-fee.dto.js';
import { UpdateFeeDto } from './dto/update-fee.dto.js';

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

  @Post()
  async createFee(@Body() body: CreateFeeDto) {
    const installments = body.method === CheckoutMethod.PIX ? 1 : (body.installments ?? 1);
    const brand = body.method === CheckoutMethod.PIX
      ? 'ALL'
      : (body.brand?.trim().toUpperCase() || 'ALL');

    if (body.method === CheckoutMethod.PIX && (body.installments !== undefined && body.installments !== 1)) {
      throw new BadRequestException('Taxas PIX devem usar uma parcela.');
    }
    if (body.method === CheckoutMethod.PIX && body.brand && body.brand.trim().toUpperCase() !== 'ALL') {
      throw new BadRequestException('Taxas PIX devem usar a bandeira ALL.');
    }

    const existing = await this.fees.findOne({
      where: { method: body.method, brand, installments },
    });
    if (existing) {
      existing.feePercent = body.feePercent;
      return this.fees.save(existing);
    }

    return this.fees.save(
      this.fees.create({
        method: body.method,
        brand,
        installments,
        feePercent: body.feePercent,
      }),
    );
  }

  @Patch(':id')
  async updateFee(@Param('id') id: string, @Body() body: UpdateFeeDto) {
    const fee = await this.fees.findOne({ where: { id } });
    if (!fee) throw new NotFoundException('Taxa não encontrada.');

    fee.feePercent = body.feePercent;
    return this.fees.save(fee);
  }

  @Get()
  async getFees(
    @Query('method') method: CheckoutMethod = CheckoutMethod.CARD,
    @Query('brand') brand?: string,
  ) {
    if (!brand) {
      return this.fees.find({
        where: { method },
        order: { installments: 'ASC' },
      });
    }

    const normalizedBrand = brand.trim().toUpperCase();
    return this.fees.find({
      where: [
        { method, brand: normalizedBrand },
        ...(normalizedBrand === 'ALL' ? [] : [{ method, brand: 'ALL' }]),
      ],
      order: { installments: 'ASC' },
    });
  }
}
