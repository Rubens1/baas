import { IsNumber, Max, Min } from 'class-validator';

export class UpdateFeeDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  feePercent: number;
}
