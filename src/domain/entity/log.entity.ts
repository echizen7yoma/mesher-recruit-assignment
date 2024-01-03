import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { BaseAuditEntity } from './base.audit.entity';
import { BlockEntity } from './block.entity';

@Entity()
export class LogEntity extends BaseAuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  logIndex: number;

  @Column()
  transactionIndex: number;

  @Column({ type: 'text', nullable: true })
  data: string;

  @Column()
  removed: boolean;

  @Column()
  address: string;

  @ManyToOne(() => TransactionEntity, (transaction) => transaction.logs)
  transaction: TransactionEntity;

  @ManyToOne(() => BlockEntity, (block) => block.logs)
  block: BlockEntity; // Add block property
}
