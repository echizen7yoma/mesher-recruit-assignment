import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BlockEntity } from './block.entity';
import { TransactionReceiptEntity } from './transaction-receipt.entity';
import { LogEntity } from './log.entity';
import { BaseAuditEntity } from './base.audit.entity';

@Entity()
export class TransactionEntity extends BaseAuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  transactionHash: string;

  @Column()
  from: string;

  @Column({ nullable: true })
  to: string;

  @Column({ nullable: true })
  value: string;

  @ManyToOne(() => BlockEntity, (block) => block.transactions)
  block: BlockEntity;

  @OneToMany(() => TransactionReceiptEntity, (receipt) => receipt.transaction)
  receipts: TransactionReceiptEntity[];

  @OneToMany(() => LogEntity, (log) => log.transaction)
  logs: LogEntity[];
}
