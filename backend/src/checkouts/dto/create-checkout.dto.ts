import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CheckoutMethod } from '../../entities/Checkout.js';

export class CreateCheckoutDto {
  @IsEnum(CheckoutMethod)
  method: CheckoutMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  installments?: number;

  @IsOptional()
  @IsString()
  brand?: string;
}
