import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallet/wallet.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { FeesModule } from './fees/fees.module.js';
import { CheckoutsModule } from './checkouts/checkouts.module.js';
import { WithdrawalsModule } from './withdrawals/withdrawals.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, // Mantenha false para usar seu script SQL estruturado
        logging: configService.get<string>('DB_LOGGING') === 'true',
      }),
    }),
    WalletModule,
    UsersModule,
    AuthModule,
    FeesModule,
    CheckoutsModule,
    WithdrawalsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}