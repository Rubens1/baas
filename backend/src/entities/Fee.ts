import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CheckoutMethod } from './Checkout.js';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: number | string) => Number(value),
};

@Entity('fees')
export class Fee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CheckoutMethod })
  method: CheckoutMethod;

  @Column({ type: 'varchar', length: 32, default: 'ALL' })
  brand: string;

  @Column({ type: 'int', default: 1 })
  installments: number;

  @Column({
    name: 'fee_percent',
    type: 'decimal',
    precision: 7,
    scale: 4,
    transformer: decimalTransformer,
  })
  feePercent: number;
}
