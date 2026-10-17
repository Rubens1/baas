import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: number | string) => Number(value),
};

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "merchant_id", type: "varchar", length: 36, unique: true })
  merchantId: string;

  @Column({ name: "balance_available", type: "decimal", precision: 12, scale: 2, default: 0.00, transformer: decimalTransformer })
  balanceAvailable: number;

  @Column({ name: "balance_blocked", type: "decimal", precision: 12, scale: 2, default: 0.00, transformer: decimalTransformer })
  balanceBlocked: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}