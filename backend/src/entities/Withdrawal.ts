import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: number | string) => Number(value),
};

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id', type: 'varchar', length: 36 })
  merchantId: string;

  @Column({ type: 'varchar', length: 32, default: 'PENDING' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({ name: 'destination_type', type: 'varchar', length: 16 })
  destinationType: 'PIX' | 'ACCOUNT';

  @Column({ name: 'destination_data', type: 'json' })
  destinationData: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
