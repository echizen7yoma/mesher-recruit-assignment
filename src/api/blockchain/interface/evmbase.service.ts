import { ethers } from 'ethers';
import { OnModuleInit } from '@nestjs/common';

export interface EvmbaseService extends OnModuleInit {
  provider: ethers.Provider;
  init(): void;
  getBlockByNumber(blockNumber: number): Promise<any>;
  getLatestBlockNumber(): Promise<number>;
  getLogsByBlockHash(blockHash: string): Promise<any>;
  getTransactionByTransactionHash(transactionHash: string): Promise<any>;
  getTransactionReceiptByTransactionHash(transactionHash: string): Promise<any>;
  saveBlockData(blockNumber: number): void;
}
