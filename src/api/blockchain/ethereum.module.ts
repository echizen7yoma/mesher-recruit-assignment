import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthereumService } from './ethereum.service';
import { BlockEntity } from '../../domain/entity/block.entity';
import { TransactionEntity } from '../../domain/entity/transaction.entity';
import { TransactionReceiptEntity } from '../../domain/entity/transaction-receipt.entity';
import { LogEntity } from '../../domain/entity/log.entity';
import { SlackModule } from '../../common/slack/slack.module';
import { EthereumController } from './ethereum.controller';

@Module({
  imports: [
    SlackModule,
    TypeOrmModule.forFeature([
      BlockEntity,
      TransactionEntity,
      TransactionReceiptEntity,
      LogEntity,
    ]),
  ],
  controllers: [EthereumController],
  providers: [EthereumService],
})
export class EthereumModule {}
