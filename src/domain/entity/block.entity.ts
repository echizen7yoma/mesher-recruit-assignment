import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { BaseAuditEntity } from './base.audit.entity';
import { LogEntity } from './log.entity';

@Entity()
export class BlockEntity extends BaseAuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  blockHash: string;

  @Column({ unique: true })
  blockNumber: number;

  @Column()
  timestamp: Date;

  @Column({ length: 255 })
  nonce: string;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.block)
  transactions: TransactionEntity[];

  @OneToMany(() => LogEntity, (log) => log.block)
  logs: LogEntity[];
}
