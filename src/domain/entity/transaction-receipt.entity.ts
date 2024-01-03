import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { BaseAuditEntity } from './base.audit.entity';

@Entity()
export class TransactionReceiptEntity extends BaseAuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  receiptHash: string;

  @Column()
  from: string;

  @Column({ nullable: true })
  to: string;

  @Column()
  status: number;

  @ManyToOne(() => TransactionEntity, (transaction) => transaction.receipts)
  transaction: TransactionEntity;
}
