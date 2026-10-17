import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/Transaction.js';
import { Wallet } from '../entities/Wallet.js';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly wallets: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
  ) {}

  async getWallet(merchantId: string): Promise<Wallet> {
    const wallet = await this.wallets.findOne({ where: { merchantId } });
    if (!wallet) throw new NotFoundException('Carteira não encontrada.');
    return wallet;
  }

  async getTransactions(
    merchantId: string,
    filters: { status?: string; type?: string; limit: number },
  ) {
    const wallet = await this.getWallet(merchantId);
    const transactions = await this.transactions.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });

    return transactions
      .map((transaction) => ({
        ...transaction,
        status:
          transaction.status === 'COMPLETED'
            ? 'APPROVED'
            : transaction.status === 'FAILED'
              ? 'DENIED'
              : 'PENDING',
      }))
      .filter((transaction) => !filters.status || transaction.status === filters.status)
      .filter((transaction) => !filters.type || transaction.type === filters.type)
      .slice(0, filters.limit);
  }

  async getSummary(merchantId: string) {
    const wallet = await this.getWallet(merchantId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlyTransactions = this.transactions
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId: wallet.id })
      .andWhere('transaction.createdAt >= :monthStart', { monthStart })
      .andWhere('transaction.createdAt < :nextMonthStart', { nextMonthStart });

    const [received, transactionsThisMonth, recentTransactions] = await Promise.all([
      monthlyTransactions
        .clone()
        .select('COALESCE(SUM(transaction.amount), 0)', 'total')
        .andWhere('transaction.status = :status', { status: 'COMPLETED' })
        .andWhere('transaction.type IN (:...types)', { types: ['PIX_IN', 'CARD_IN'] })
        .getRawOne<{ total: string | number }>(),
      monthlyTransactions.clone().getCount(),
      this.transactions.find({
        where: { walletId: wallet.id },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      balanceAvailable: wallet.balanceAvailable,
      balanceBlocked: wallet.balanceBlocked,
      receivedThisMonth: Number(received?.total ?? 0),
      transactionsThisMonth,
      recentTransactions: recentTransactions.map((transaction) => ({
        ...transaction,
        status:
          transaction.status === 'COMPLETED'
            ? 'APPROVED'
            : transaction.status === 'FAILED'
              ? 'DENIED'
              : 'PENDING',
      })),
    };
  }
}
