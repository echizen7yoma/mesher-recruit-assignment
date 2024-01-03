// sample.controller.ts

import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EthereumService } from './ethereum.service';
import { BlockEntity } from '../../domain/entity/block.entity';
import { TransactionReceiptEntity } from '../../domain/entity/transaction-receipt.entity';

@ApiTags('Ethereum Block With Transaction') // Swagger 태그 추가
@Controller('v1/eth')
export class EthereumController {
  constructor(private readonly ethereumService: EthereumService) {}
  // 블록 해시 기준으로 블록 조회
  @Get(':blockHash')
  @ApiOperation({ summary: 'Get Block by Hash' })
  @ApiParam({ name: 'blockHash', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Block details',
  })
  async getBlockByHash(
    @Param('blockHash') blockHash: string,
  ): Promise<BlockEntity> {
    return this.ethereumService.getDatabaseBlockByBlockHash(blockHash);
  }

  // 블록에 포함된 TransactionReceipt,Log 까지 보여주는 API
  @Get(':blockHash/transactions')
  @ApiOperation({ summary: 'Get Block include TransactionReceipt, Log' })
  @ApiParam({ name: 'blockHash', type: 'string' })
  async getBlockIncludeTransactionAndLog(
    @Param('blockHash') blockHash: string,
  ): Promise<BlockEntity[]> {
    return this.ethereumService.getDatabaseBlockByBlockHashIncludeEntity(
      blockHash,
    );
  }

  @Get(':transactionHash/transactionReceipt')
  @ApiOperation({ summary: 'Get TransactionReceipt By transactionHash' })
  @ApiParam({ name: 'transactionHash', type: 'string' })
  async getTransactionReceiptByTransactionHash(
    @Param('transactionHash') transactionHash: string,
  ): Promise<TransactionReceiptEntity> {
    console.log('###dhodlrp ');
    console.log(transactionHash);
    return this.ethereumService.getDatabaseTransactionReceiptByTransactionHash(
      transactionHash,
    );
  }

  @Get(':walletAddress/transactionReceipt/address')
  @ApiOperation({ summary: 'Get TransactionReceipt By Address' })
  @ApiParam({ name: 'walletAddress', type: 'string' })
  async getTransactionReceiptByAddress(
    @Param('walletAddress') walletAddress: string,
  ): Promise<TransactionReceiptEntity[]> {
    return this.ethereumService.getDatabaseTransactionReceiptByAddress(
      walletAddress,
    );
  }

  @Get(':transactionHash/transactionReceipt/log')
  @ApiOperation({
    summary: 'Get TransactionReceipt and Log By transactionHash',
  })
  @ApiParam({ name: 'transactionHash', type: 'string' })
  async getTransactionReceiptLog(
    @Param('transactionHash') transactionHash: string,
  ): Promise<TransactionReceiptEntity[]> {
    return this.ethereumService.getDatabaseTransactionReceiptLog(
      transactionHash,
    );
  }
}
