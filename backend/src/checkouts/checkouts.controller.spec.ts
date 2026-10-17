import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Checkout, CheckoutMethod } from '../entities/Checkout.js';
import { Fee } from '../entities/Fee.js';
import { Transaction } from '../entities/Transaction.js';
import { Wallet } from '../entities/Wallet.js';
import { CheckoutsController } from './checkouts.controller.js';

describe('CheckoutsController', () => {
  let controller: CheckoutsController;
  let checkoutSave: ReturnType<typeof vi.fn>;
  let feeFindOne: ReturnType<typeof vi.fn>;
  let transactionSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    checkoutSave = vi.fn(async (value) => ({ id: 'checkout-id', ...value }));
    transactionSave = vi.fn(async (value) => value);
    feeFindOne = vi.fn(async () => ({ feePercent: 0 }));
    const repositories = new Map<any, any>([
      [
        Checkout,
        {
          create: (value: object) => value,
          save: checkoutSave,
        },
      ],
      [
        Fee,
        {
          findOne: feeFindOne,
        },
      ],
      [
        Wallet,
        {
          findOne: vi.fn().mockResolvedValue({ id: 'wallet-id' }),
        },
      ],
      [
        Transaction,
        {
          create: (value: object) => value,
          save: transactionSave,
        },
      ],
    ]);
    const dataSource = {
      transaction: (operation: (manager: { getRepository: (entity: unknown) => unknown }) => unknown) =>
        operation({
          getRepository: (entity) => repositories.get(entity as never),
        }),
    } as DataSource;
    controller = new CheckoutsController(
      { find: vi.fn() } as never,
      { findOne: feeFindOne } as unknown as never,
      dataSource,
    );
  });

  it('rejects a card checkout when a local fee is not configured', async () => {
    feeFindOne.mockResolvedValue(null);

    await expect(
      controller.create('merchant-id', {
        method: CheckoutMethod.CARD,
        amount: 100,
        installments: 3,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(checkoutSave).not.toHaveBeenCalled();
  });

  it('creates a checkout and a pending ledger entry using the local fee', async () => {
    await controller.create('merchant-id', {
      method: CheckoutMethod.CARD,
      amount: 100,
      installments: 1,
    });

    expect(feeFindOne).toHaveBeenCalledWith({
      where: { method: CheckoutMethod.CARD, brand: 'ALL', installments: 1 },
    });
    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({ feePercent: 0, status: 'PENDING' }),
    );
    expect(transactionSave).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 100, status: 'PENDING' }),
    );
  });
});
