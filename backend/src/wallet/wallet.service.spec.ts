import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../entities/Transaction.js';
import { Wallet } from '../entities/Wallet.js';
import { WalletService } from './wallet.service.js';

describe('WalletService', () => {
  let service: WalletService;
  const wallets = { findOne: vi.fn() };
  const transactions = { find: vi.fn(), createQueryBuilder: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: wallets },
        { provide: getRepositoryToken(Transaction), useValue: transactions },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns wallet balances, monthly totals, and recent transactions', async () => {
    wallets.findOne.mockResolvedValue({
      id: 'wallet-id',
      merchantId: 'merchant-id',
      balanceAvailable: 123.45,
      balanceBlocked: 10,
    });

    const receivedQuery = {
      select: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getRawOne: vi.fn().mockResolvedValue({ total: '200.5' }),
    };
    const countQuery = { getCount: vi.fn().mockResolvedValue(3) };
    const queryBuilder = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      clone: vi.fn()
        .mockReturnValueOnce(receivedQuery)
        .mockReturnValueOnce(countQuery),
    };
    const recentTransaction = {
      id: 'transaction-id',
      walletId: 'wallet-id',
      type: 'PIX_IN',
      status: 'COMPLETED',
      amount: 200.5,
      createdAt: new Date('2026-10-10T12:00:00.000Z'),
    };
    transactions.createQueryBuilder.mockReturnValue(queryBuilder);
    transactions.find.mockResolvedValue([recentTransaction]);

    await expect(service.getSummary('merchant-id')).resolves.toEqual({
      balanceAvailable: 123.45,
      balanceBlocked: 10,
      receivedThisMonth: 200.5,
      transactionsThisMonth: 3,
      recentTransactions: [{ ...recentTransaction, status: 'APPROVED' }],
    });
  });
});
