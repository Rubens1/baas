import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CheckoutMethod } from '../../entities/Checkout.js';

export class CreateFeeDto {
  @IsEnum(CheckoutMethod)
  method: CheckoutMethod;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  brand?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  installments?: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  feePercent: number;
}
