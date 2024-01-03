// ethereum.service.ts
import { Injectable } from '@nestjs/common';
import { EvmbaseService } from './interface/evmbase.service';
import { Block, ethers, Log } from 'ethers';
import { BlockEntity } from '../../domain/entity/block.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity } from '../../domain/entity/log.entity';
import { TransactionEntity } from '../../domain/entity/transaction.entity';
import { TransactionReceiptEntity } from '../../domain/entity/transaction-receipt.entity';
import { SlackService } from '../../common/slack/slack.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EthereumService implements EvmbaseService {
  provider: ethers.Provider;
  constructor(
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>,
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(TransactionReceiptEntity)
    private readonly transactionReceiptRepository: Repository<TransactionReceiptEntity>,
    private readonly slackService: SlackService,
  ) {
    this.provider = new ethers.JsonRpcProvider(
      'https://goerli.infura.io/v3/30ee15d79a3a4ad9be140875543c1dfa',
    );
    // 'https://mainnet.infura.io/v3/98240be3b12a4e7b9abeb98172dceb68',
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async countDatabaseQuery() {
    try {
      console.log(
        '5분마다 현재 데이터베이스에 저장된 Block, TranactionReceipt, Log 체크',
      );
      const blockCount = this.getDatabaseBlockTableCountQuery();
      const transactionReceiptCount =
        this.getDatabaseTransactionReceiptTableCountQuery();
      const logCount = this.getDatabaseLogTableCountQuery();

      await this.slackService.sendMessage(
        `blockCount: ${blockCount} \n transactionReceiptCount: ${transactionReceiptCount} \n logCount: ${logCount}`,
      );
    } catch (error) {
      await this.slackService.sendMessage(
        `count error!!!!!!!!!!!! \n error: ${error}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async healthy() {
    try {
      console.log('every 1 hour');
      const blockCount = this.getDatabaseBlockTableCountQuery();
      const rpcBlock = this.getLatestBlockNumber();
      await this.slackService.sendMessage(
        `server status: block count query: ${blockCount} \n rpcBlock: ${rpcBlock}`,
      );
    } catch (error) {
      await this.slackService.sendMessage(
        `server status: ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!! ${error}`,
      );
    }
  }

  // 매분 실행으로 infura는 쿼리를 자제하고, 배치로만 가져온다. 그 외 데이터 가져오는 것은 dbms에서 하는 것으로
  @Cron(CronExpression.EVERY_MINUTE)
  async saveBlockDataBatch() {
    console.log('every minute start');
    await this.init();
  }

  async onModuleInit() {
    console.log(`The EVM ethereum module has been initialized.`);
    await this.init();
  }

  async getBlockByNumber(blockNumber: number): Promise<any> {
    return await this.provider.getBlock(blockNumber);
  }

  async getLatestBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getLogsByBlockHash(blockHash: string): Promise<any> {
    return await this.provider.getLogs({ blockHash: blockHash });
  }

  async getTransactionByTransactionHash(transactionHash: string): Promise<any> {
    return await this.provider.getTransaction(transactionHash);
  }

  async getTransactionReceiptByTransactionHash(
    transactionHash: string,
  ): Promise<any> {
    return await this.provider.getTransactionReceipt(transactionHash);
  }

  async init() {
    try {
      const getDatabaseMaxBlockNumber =
        (await this.getDatabaseMaxBlockNumber()) ?? 0;
      const getRpcLatestBlockNumber = await this.getLatestBlockNumber();
      console.log(
        `getDatabaseMaxBlockNumber: ${getDatabaseMaxBlockNumber}, getRpcLatestBlockNumber: ${getRpcLatestBlockNumber}`,
      );

      // database에 있는 blockNumber보다 rpc통신해서 받아온 blockNumber보다 클때 데이터 저장
      if (getDatabaseMaxBlockNumber < getRpcLatestBlockNumber) {
        const index =
          getDatabaseMaxBlockNumber < getRpcLatestBlockNumber - 10
            ? getRpcLatestBlockNumber - 10
            : getDatabaseMaxBlockNumber + 1;
        console.log(`start index: ${index}`);
        // 블록 내부의 데이터는 크기 때문에, 10개의 블록으로 비교한다. (정책 필요)
        for (let i = index; i < getRpcLatestBlockNumber; i++) {
          await this.saveBlockData(i);
        }
      }
      console.log('end.');
    } catch (error) {
      await this.slackService.sendMessage(`blockdata fetch error ${error}`);
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseBlockByBlockHash(blockHash: string): Promise<BlockEntity> {
    try {
      return await this.blockRepository.findOne({
        where: { blockHash: blockHash },
      });
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseTransactionReceiptByTransactionHash(
    transactionHash: string,
  ): Promise<TransactionReceiptEntity> {
    try {
      return await this.transactionReceiptRepository.findOne({
        where: { receiptHash: transactionHash },
      });
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseTransactionReceiptByAddress(
    address: string,
  ): Promise<TransactionReceiptEntity[]> {
    try {
      return this.transactionReceiptRepository
        .createQueryBuilder('receipt')
        .where('receipt.from = :address OR receipt.to = :address', {
          address,
        })
        .getMany();
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseTransactionReceiptLog(
    transactionHash: string,
  ): Promise<TransactionReceiptEntity[]> {
    try {
      return this.transactionReceiptRepository
        .createQueryBuilder('receipt')
        .leftJoinAndSelect('receipt.transaction', 'transaction')
        .leftJoinAndSelect('transaction.logs', 'log')
        .where('receipt.receiptHash = :transactionHash', {
          transactionHash,
        })
        .getMany();
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseBlockByBlockHashIncludeEntity(
    blockHash: string,
  ): Promise<BlockEntity[]> {
    try {
      return this.blockRepository
        .createQueryBuilder('block')
        .leftJoinAndSelect('block.transactions', 'transaction')
        .leftJoinAndSelect('transaction.receipts', 'receipt')
        .leftJoinAndSelect('transaction.logs', 'log')
        .where('block.blockHash = :blockHash', { blockHash })
        .getMany();
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseBlockTableCountQuery(): Promise<number> {
    try {
      return await this.blockRepository.count();
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseTransactionReceiptTableCountQuery(): Promise<number> {
    try {
      return await this.transactionReceiptRepository.count();
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseLogTableCountQuery(): Promise<number> {
    try {
      return await this.logRepository.count();
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  async getDatabaseMaxBlockNumber(): Promise<number> {
    try {
      const maxResult = await this.blockRepository
        .createQueryBuilder('block')
        .select('MAX("blockNumber")', 'maxValue')
        .getRawOne();

      return maxResult.maxValue;
    } catch (error) {
      console.error(error);
      console.trace(error);
    }
  }

  //TODO Database Transaction
  async saveBlockData(blockNumber: number) {
    console.log(`save BlockNumber: ${blockNumber}`);
    const block = await this.getBlockByNumber(blockNumber);

    // 블록 매핑 및 저장
    const blockEntity: {
      blockHash: string;
      blockNumber: number;
      timestamp: Date;
      nonce: string;
    } = {
      blockHash: block.hash,
      blockNumber: block.number,
      timestamp: new Date(block.timestamp * 1000),
      nonce: block.nonce,
    };
    const savedBlock = await this.blockRepository.save(blockEntity);

    // 트랜잭션 일괄 처리
    const transactionsToSave = await Promise.all(
      block.transactions.map(async (tx) => {
        const rpcTransactionResponse: ethers.TransactionResponse =
          await this.provider.getTransaction(tx);

        return {
          transactionHash: rpcTransactionResponse.hash,
          from: rpcTransactionResponse.from,
          to: rpcTransactionResponse.to,
          value: ethers.getBigInt(rpcTransactionResponse.value),
          block: savedBlock,
        };
      }),
    );

    await this.transactionRepository.save(transactionsToSave);

    const transactionReceiptToSave = await Promise.all(
      block.transactions.map(async (tx) => {
        const rpcTransactionReceiptResponse: ethers.TransactionReceipt =
          await this.provider.getTransactionReceipt(tx);

        const foundTransaction = await this.transactionRepository.findOne({
          where: { transactionHash: rpcTransactionReceiptResponse.hash },
        });

        return {
          receiptHash: rpcTransactionReceiptResponse.hash,
          from: rpcTransactionReceiptResponse.from,
          to: rpcTransactionReceiptResponse.to,
          status: rpcTransactionReceiptResponse.status,
          transaction: foundTransaction,
        };
      }),
    );

    const logs: Array<Log> = await this.getLogsByBlockHash(block.hash);
    // 로그 일괄 처리
    const logsToSave = await Promise.all(
      logs.map(async (log) => {
        const foundTransaction = await this.transactionRepository.findOne({
          where: { transactionHash: log.transactionHash },
        });

        return {
          logIndex: log.index,
          transactionIndex: log.transactionIndex,
          data: log.data,
          removed: log.removed,
          address: log.address,
          block: savedBlock,
          transaction: foundTransaction,
        };
      }),
    );

    // 트랜잭션 일괄 처리
    await this.transactionReceiptRepository.save(transactionReceiptToSave);
    await this.logRepository.save(logsToSave);

    return savedBlock;
  }
}
