import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthService } from '../auth/auth.service.js';
import { WalletController } from './wallet.controller.js';
import { WalletService } from './wallet.service.js';

describe('WalletController', () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        { provide: WalletService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: AuthGuard, useValue: { canActivate: vi.fn(() => true) } },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
