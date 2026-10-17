import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from '../entities/AuthSession.js';
import { Merchant } from '../entities/Merchant.js';
import { AuthGuard } from './auth.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuthSession, Merchant])],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
