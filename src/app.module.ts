import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthereumModule } from './api/blockchain/ethereum.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PostgresService } from './common/database/postgres.service';
import { PostgresModule } from './common/database/postgres.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [PostgresModule], // YourDatabaseModule import
      inject: [PostgresService], // YourDatabaseService 사용
      useFactory: (configService: PostgresService) => {
        return configService.getDatabaseConfig();
      },
    }),
    EthereumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
