import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CheckoutMethod } from '../entities/Checkout.js';
import { FeesController } from './fees.controller.js';

describe('FeesController', () => {
  let controller: FeesController;
  let findOne: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findOne = vi.fn().mockResolvedValue(null);
    save = vi.fn(async (fee) => ({ id: 'fee-id', ...fee }));
    controller = new FeesController({
      create: (value) => value,
      find: vi.fn(),
      findOne,
      save,
    } as never);
  });

  it('creates a PIX fee with one installment and the ALL brand', async () => {
    await controller.createFee({
      method: CheckoutMethod.PIX,
      feePercent: 1.25,
    });

    expect(save).toHaveBeenCalledWith({
      method: CheckoutMethod.PIX,
      brand: 'ALL',
      installments: 1,
      feePercent: 1.25,
    });
  });

  it('normalizes a card brand before checking and saving the fee', async () => {
    await controller.createFee({
      method: CheckoutMethod.CARD,
      brand: ' visa ',
      installments: 3,
      feePercent: 2.5,
    });

    expect(findOne).toHaveBeenCalledWith({
      where: { method: CheckoutMethod.CARD, brand: 'VISA', installments: 3 },
    });
    expect(save).toHaveBeenCalledWith({
      method: CheckoutMethod.CARD,
      brand: 'VISA',
      installments: 3,
      feePercent: 2.5,
    });
  });

  it('updates an existing rate with the same method, brand, and installments', async () => {
    const existing = { id: 'existing-fee', feePercent: 0 };
    findOne.mockResolvedValue(existing);

    await controller.createFee({
      method: CheckoutMethod.CARD,
      installments: 1,
      feePercent: 2,
    });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      id: 'existing-fee',
      feePercent: 2,
    }));
  });

  it('rejects PIX rates configured for a card brand or installments', async () => {
    await expect(controller.createFee({
      method: CheckoutMethod.PIX,
      brand: 'VISA',
      feePercent: 1,
    })).rejects.toBeInstanceOf(BadRequestException);

    await expect(controller.createFee({
      method: CheckoutMethod.PIX,
      installments: 2,
      feePercent: 1,
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('updates the percentage of an existing fee by id', async () => {
    const fee = { id: 'fee-id', feePercent: 0 };
    findOne.mockResolvedValue(fee);

    await controller.updateFee('fee-id', { feePercent: 2.75 });

    expect(findOne).toHaveBeenCalledWith({ where: { id: 'fee-id' } });
    expect(save).toHaveBeenCalledWith({ id: 'fee-id', feePercent: 2.75 });
  });

  it('returns not found when editing a missing fee', async () => {
    findOne.mockResolvedValue(null);

    await expect(controller.updateFee('missing-id', { feePercent: 2 }))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(save).not.toHaveBeenCalled();
  });
});
