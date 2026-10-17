import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth/auth.service.js';
import { Merchant } from '../entities/Merchant.js';
import { Wallet } from '../entities/Wallet.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly dataSource: DataSource, private readonly auth: AuthService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    const email = body.email.trim().toLowerCase();
    const document = body.document.replace(/\D/g, '');
    const merchants = this.dataSource.getRepository(Merchant);
    const existing = await merchants.findOne({
      where: [{ email }, { document }],
    });
    if (existing) throw new ConflictException('E-mail ou documento já cadastrado.');

    const password = await this.auth.hashPassword(body.password);
    const merchant = await this.dataSource.transaction(async (manager) => {
      const merchantRepository = manager.getRepository(Merchant);
      const walletRepository = manager.getRepository(Wallet);
      const created = await merchantRepository.save(
        merchantRepository.create({
          name: body.name.trim(),
          email,
          phone: body.phone,
          document,
          type: body.type,
          ...password,
        }),
      );
      await walletRepository.save(walletRepository.create({ merchantId: created.id }));
      return created;
    });

    return {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      type: merchant.type,
    };
  }
}
