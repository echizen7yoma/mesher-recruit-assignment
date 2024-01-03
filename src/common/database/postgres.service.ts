import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionEntity } from '../../domain/entity/transaction.entity';
import { TransactionReceiptEntity } from '../../domain/entity/transaction-receipt.entity';
import { BlockEntity } from '../../domain/entity/block.entity';
import { LogEntity } from '../../domain/entity/log.entity';

@Injectable()
export class PostgresService {
  constructor(private readonly configService: ConfigService) {}

  getDatabaseConfig(): any {
    return {
      type: this.configService.get<string>('DB_TYPE'),
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      entities: [
        TransactionEntity,
        TransactionReceiptEntity,
        BlockEntity,
        LogEntity,
      ],
      synchronize: this.configService.get<string>('IS_LOCAL'),
      // ...
    };
  }
}
