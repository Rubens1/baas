import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 32 })
  phone: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  document: string;

  @Column({ type: 'enum', enum: ['PF', 'PJ'] })
  type: 'PF' | 'PJ';

  @Column({ name: 'password_hash', type: 'varchar', length: 128 })
  passwordHash: string;

  @Column({ name: 'password_salt', type: 'varchar', length: 64 })
  passwordSalt: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
