import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkout } from '../entities/Checkout.js';
import { Fee } from '../entities/Fee.js';
import { AuthModule } from '../auth/auth.module.js';
import { CheckoutsController } from './checkouts.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Checkout, Fee]), AuthModule],
  controllers: [CheckoutsController],
})
export class CheckoutsModule {}
