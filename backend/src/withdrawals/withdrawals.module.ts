import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from '../entities/Withdrawal.js';
import { AuthModule } from '../auth/auth.module.js';
import { WithdrawalsController } from './withdrawals.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Withdrawal]), AuthModule],
  controllers: [WithdrawalsController],
})
export class WithdrawalsModule {}
