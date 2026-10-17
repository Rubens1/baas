import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../entities/Wallet.js';
import { Transaction } from '../entities/Transaction.js';
import { WalletController } from './wallet.controller.js';
import { WalletService } from './wallet.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction]), AuthModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}