import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Wallet } from "./Wallet.js";

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: number | string) => Number(value),
};

export enum TransactionType {
  PIX_IN = "PIX_IN",
  CARD_IN = "CARD_IN",
  WITHDRAWAL = "WITHDRAWAL",
  FEE = "FEE",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

@Entity("transactions")
export class Transaction {
  @PrimaryColumn("varchar", { length: 36 })
  id: string;

  @Column({ name: "wallet_id", type: "varchar", length: 36 })
  walletId: string;

  @ManyToOne(() => Wallet, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "wallet_id" })
  wallet: Wallet;

  @Column({ type: "enum", enum: TransactionType })
  type: TransactionType;

  @Column({ type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: "decimal", precision: 12, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0.00, transformer: decimalTransformer })
  fee: number;

  @Column({ name: "external_reference", type: "varchar", length: 255, nullable: true, unique: true })
  externalReference: string;

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}