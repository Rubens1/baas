import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from '../entities/Fee.js';
import { AuthModule } from '../auth/auth.module.js';
import { FeesController } from './fees.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Fee]), AuthModule],
  controllers: [FeesController],
})
export class FeesModule {}
