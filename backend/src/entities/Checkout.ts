import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const decimalTransformer = {
  to: (value: number | null) => value,
  from: (value: number | string | null) =>
    value === null ? null : Number(value),
};

export enum CheckoutMethod {
  PIX = 'PIX',
  CARD = 'CARD',
}

export enum CheckoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('checkouts')
export class Checkout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id', type: 'varchar', length: 36 })
  merchantId: string;

  @Column({ name: 'external_reference', type: 'varchar', length: 100, unique: true })
  externalReference: string;

  @Column({ type: 'enum', enum: CheckoutMethod })
  method: CheckoutMethod;

  @Column({ type: 'enum', enum: CheckoutStatus, default: CheckoutStatus.PENDING })
  status: CheckoutStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({
    name: 'fee_percent',
    type: 'decimal',
    precision: 7,
    scale: 4,
    nullable: true,
    transformer: decimalTransformer,
  })
  feePercent: number | null;

  @Column({ type: 'int', nullable: true })
  installments: number | null;

  @Column({ name: 'qr_code_base64', type: 'longtext', nullable: true })
  qrCodeBase64: string | null;

  @Column({ type: 'text', nullable: true })
  emv: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
