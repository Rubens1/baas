import { IsIn, IsNumber, IsObject, IsPositive } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsIn(['PIX', 'ACCOUNT'])
  destinationType: 'PIX' | 'ACCOUNT';

  @IsObject()
  destinationData: Record<string, unknown>;
}
