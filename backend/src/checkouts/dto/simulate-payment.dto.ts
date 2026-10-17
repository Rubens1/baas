import { IsIn } from 'class-validator';
import { CheckoutStatus } from '../../entities/Checkout.js';

export class SimulatePaymentDto {
  @IsIn([
    CheckoutStatus.APPROVED,
    CheckoutStatus.DENIED,
    CheckoutStatus.EXPIRED,
    CheckoutStatus.CANCELLED,
  ])
  status:
    | CheckoutStatus.APPROVED
    | CheckoutStatus.DENIED
    | CheckoutStatus.EXPIRED
    | CheckoutStatus.CANCELLED;
}
