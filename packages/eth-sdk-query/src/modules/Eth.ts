import BN from 'bn.js';
import {
  isTag,
  toHex,
  toBN,
  toNumber,
  cleanEmpty,
  toChecksumAddress,
  TQuantity,
  TData,
  TTagOrQuantity,
} from '@eth-sdk/utils';
import { IQuery } from '../interfaces';

export class Eth {
  public static prepareBlockResult(raw: Eth.raw.IBlockResult): Eth.IBlockResult {
    if (!raw) {
      return null;
    }

    const {
      hash,
      number,
      gasLimit,
      gasUsed,
    } = raw;

    return {
      hash,
      number: toNumber(number),
      gasLimit: toNumber(gasLimit),
      gasUsed: toNumber(gasUsed),
    };
  }

  public static prepareBlockResultWithTransactions(raw: Eth.raw.IBlockResult): Eth.IBlockResultWithTransactions {
    if (!raw) {
      return null;
    }

    const { transactions } = raw;

    return {
      ...this.prepareBlockResult(raw),
      transactions: transactions.map(transaction => typeof transaction === 'object'
        ? this.prepareTransactionResult(transaction)
        : transaction,
      ),
    };
  }

  public static prepareTransactionResult(raw: Eth.raw.ITransactionResult): Eth.ITransactionResult {
    if (!raw) {
      return null;
    }

    const {
      blockHash,
      blockNumber,
      hash,
      transactionIndex: index,
      from,
      to,
      gas,
      gasPrice,
      input,
      value,
    } = raw;

    return {
      blockHash,
      hash,
      input,
      from: toChecksumAddress(from),
      to: toChecksumAddress(to),
      blockNumber: toNumber(blockNumber),
      index: toNumber(index),
      gas: toNumber(gas),
      gasPrice: toBN(gasPrice),
      value: toBN(value),
    };
  }

  public static prepareLogResult(raw: Eth.raw.ILogResult): Eth.ILogResult {
    if (!raw) {
      return null;
    }

    const {
      logIndex: index,
      transactionHash,
      transactionIndex,
      blockHash,
      blockNumber,
      address,
      data,
      topics,
    } = raw;

    return {
      transactionHash,
      blockHash,
      data,
      topics,
      index: toNumber(index),
      transactionIndex: toNumber(transactionIndex),
      blockNumber: toNumber(blockNumber),
      address: toChecksumAddress(address),
    };
  }

  constructor(
    private query: IQuery,
  ) {
    //
  }

  public get gasPrice(): Promise<BN> {
    return this.query
      .send(
        Eth.Methods.GasPrice,
      )
      .then(raw => toBN(raw, null));
  }

  public get accounts(): Promise<string[]> {
    return this.query
      .send<string[]>(
        Eth.Methods.Accounts,
      )
      .then(accounts => accounts.map(account => toChecksumAddress(account)));
  }

  public get blockNumber(): Promise<number> {
    return this.query
      .send(
        Eth.Methods.BlockNumber,
      )
      .then(raw => toNumber(raw));
  }

  public getBalance(address: string, tag: TTagOrQuantity = 'latest'): Promise<BN> {
    return this.query
      .send(
        Eth.Methods.GetBalance,
        toChecksumAddress(address),
        isTag(tag) ? tag : toHex(tag),
      )
      .then(raw => toBN(raw));
  }

  public getStorageAt(address: string, position: TQuantity, tag: TTagOrQuantity = 'latest'): Promise<string> {
    return this.query
      .send(
        Eth.Methods.GetStorageAt,
        toChecksumAddress(address),
        toHex(position),
        isTag(tag) ? tag : toHex(tag),
      );
  }

  public getTransactionCount(address: string, tag: TTagOrQuantity = 'latest'): Promise<number> {
    return this.query
      .send(
        Eth.Methods.GetTransactionCount,
        toChecksumAddress(address),
        isTag(tag) ? tag : toHex(tag),
      )
      .then(raw => toNumber(raw));
  }

  public getBlockTransactionCountByHash(hash: string): Promise<number> {
    return this.query
      .send(
        Eth.Methods.GetBlockTransactionCountByHash,
        hash,
      )
      .then(raw => toNumber(raw));
  }

  public getBlockTransactionCountByNumber(tag: TTagOrQuantity = 'latest'): Promise<number> {
    return this.query
      .send(
        Eth.Methods.GetBlockTransactionCountByNumber,
        isTag(tag) ? tag : toHex(tag),
      )
      .then(raw => toNumber(raw));
  }

  public getCode(address: string, tag: TTagOrQuantity = 'latest'): Promise<string> {
    return this.query
      .send(
        Eth.Methods.GetCode,
        toChecksumAddress(address),
        isTag(tag) ? tag : toHex(tag),
      );
  }

  public sign(address: string, data: TData): Promise<string> {
    return this.query
      .send(
        Eth.Methods.Sign,
        toChecksumAddress(address),
        toHex(data),
      );
  }

  public sendTransaction(options: Eth.ISendTransactionOptions): Promise<string> {
    const {
      from,
      to,
      gas,
      gasPrice,
      value,
      data,
      nonce,
    } = options;

    return this.query
      .send(
        Eth.Methods.SendTransaction,
        cleanEmpty({
          from: toChecksumAddress(from),
          to: toChecksumAddress(to),
          gas: toHex(gas, null),
          gasPrice: toHex(gasPrice, null),
          value: toHex(value, null),
          data: toHex(data, '0x'),
          nonce: toHex(nonce, null),
        }),
      );
  }

  public sendRawTransaction(data: TData): Promise<string> {
    return this.query
      .send(
        Eth.Methods.SendRawTransaction,
        toHex(data),
      );
  }

  public call(options: Eth.ICallOptions, tag: TTagOrQuantity = 'latest'): Promise<string> {
    const {
      from,
      to,
      gas,
      gasPrice,
      value,
      data,
    } = options;

    return this.query
      .send(
        Eth.Methods.Call,
        cleanEmpty({
          from: toChecksumAddress(from),
          to: toChecksumAddress(to),
          gas: toHex(gas, null),
          gasPrice: toHex(gasPrice, null),
          value: toHex(value, null),
          data: toHex(data, null),
        }),
        isTag(tag) ? tag : toHex(tag),
      );
  }

  public estimateGas(options: Partial<Eth.ICallOptions>): Promise<number> {
    const {
      from,
      to,
      gas,
      gasPrice,
      value,
      data,
    } = options;

    return this.query
      .send(
        Eth.Methods.EstimateGas,
        cleanEmpty({
          from: toChecksumAddress(from),
          to: toChecksumAddress(to),
          gas: toHex(gas, null),
          gasPrice: toHex(gasPrice, null),
          value: toHex(value, null),
          data: toHex(data, null),
        }),
      )
      .then(result => toNumber(result));
  }

  public getBlockByHash(hash: string): Promise<Eth.IBlockResultWithTransactions<string>>;

  public getBlockByHash(hash: string, returnTransactionObjects: true): Promise<Eth.IBlockResultWithTransactions<Eth.ITransactionResult>>;

  public getBlockByHash(...args: any[]): Promise<Eth.IBlockResultWithTransactions<any>> {
    let hash: string;
    let returnTransactionObjects: boolean;

    ([hash, returnTransactionObjects] = args);

    return this.query
      .send<Eth.raw.IBlockResult>(
        Eth.Methods.GetBlockByHash,
        hash,
        !!returnTransactionObjects,
      )
      .then(raw => Eth.prepareBlockResultWithTransactions(raw));
  }

  public getBlockByNumber(number: number): Promise<Eth.IBlockResultWithTransactions<string>>;

  public getBlockByNumber(number: number, returnTransactionObjects: true): Promise<Eth.IBlockResultWithTransactions<Eth.ITransactionResult>>;

  public getBlockByNumber(...args: any[]): Promise<Eth.IBlockResultWithTransactions<any>> {
    let number: string;
    let returnTransactionObjects: boolean;

    ([number, returnTransactionObjects] = args);

    return this.query
      .send<Eth.raw.IBlockResult>(
        Eth.Methods.GetBlockByNumber,
        toHex(number),
        !!returnTransactionObjects,
      )
      .then(raw => Eth.prepareBlockResultWithTransactions(raw));
  }

  public getTransaction(hash: string): Promise<Eth.ITransactionResult> {
    return this.query
      .send(
        Eth.Methods.GetTransactionByHash,
        hash,
      )
      .then(raw => Eth.prepareTransactionResult(raw));
  }

  public getTransactionReceipt(hash: string): Promise<Eth.ITransactionReceiptResult> {
    return this.query
      .send<Eth.raw.ITransactionReceiptResult>(
        Eth.Methods.GetTransactionReceipt,
        hash,
      )
      .then((raw) => {
        if (!raw) {
          return null;
        }

        const {
          cumulativeGasUsed,
          gasUsed,
          contractAddress,
          logs,
          status,
        } = raw;

        return {
          contractAddress: toChecksumAddress(contractAddress),
          cumulativeGasUsed: toNumber(cumulativeGasUsed),
          gasUsed: toNumber(gasUsed),
          logs: logs.map(log => Eth.prepareLogResult(log)),
          success: status === '0x1',
        };
      });
  }

  public get pendingTransactions(): Promise<Eth.ITransactionResult[]> {
    return this.query
      .send<Eth.raw.ITransactionResult[]>(
        Eth.Methods.PendingTransactions,
      )
      .then(raws => Array.isArray(raws)
        ? raws.map(raw => Eth.prepareTransactionResult(raw))
        : [],
      );
  }

  public getLogs(options: Eth.ILogOptions): Promise<Eth.ILogResult[]> {
    const {
      fromBlock,
      toBlock,
      topics,
      address,
    } = options;

    return this.query
      .send<Eth.raw.ILogResult[]>(
        Eth.Methods.GetLogs,
        cleanEmpty({
          topics,
          address,
          fromBlock: isTag(fromBlock) ? fromBlock : toHex(fromBlock, null),
          toBlock: isTag(toBlock) ? toBlock : toHex(toBlock, null),
        }),
      )
      .then(raws => Array.isArray(raws)
        ? raws.map(raw => Eth.prepareLogResult(raw))
        : [],
      );
  }
}

export namespace Eth {
  export enum Methods {
    GasPrice = 'eth_gasPrice',
    Accounts = 'eth_accounts',
    BlockNumber = 'eth_blockNumber',
    GetBalance = 'eth_getBalance',
    GetStorageAt = 'eth_getStorageAt',
    GetTransactionCount = 'eth_getTransactionCount',
    GetBlockTransactionCountByHash = 'eth_getBlockTransactionCountByHash',
    GetBlockTransactionCountByNumber = 'eth_getBlockTransactionCountByNumber',
    GetCode = 'eth_getCode',
    Sign = 'eth_sign',
    SendTransaction = 'eth_sendTransaction',
    SendRawTransaction = 'eth_sendRawTransaction',
    Call = 'eth_call',
    EstimateGas = 'eth_estimateGas',
    GetBlockByHash = 'eth_getBlockByHash',
    GetBlockByNumber = 'eth_getBlockByNumber',
    GetTransactionByHash = 'eth_getTransactionByHash',
    GetTransactionReceipt = 'eth_getTransactionReceipt',
    PendingTransactions = 'eth_pendingTransactions',
    GetLogs = 'eth_getLogs',
    Subscribe = 'eth_subscribe',
    Unsubscribe = 'eth_unsubscribe',
  }

  export namespace raw {
    export interface IBlockResult {
      number: string;
      hash: string;
      parentHash: string;
      nonce: string;
      sha3Uncles: string;
      logsBloom: string;
      transactionsRoot: string;
      stateRoot: string;
      receiptsRoot: string;
      miner: string;
      difficulty: string;
      totalDifficulty: string;
      extraData: string;
      size: string;
      gasLimit: string;
      gasUsed: string;
      timestamp: string;
      transactions: any[];
      uncles: string[];
    }

    export interface ITransactionResult {
      blockHash: string;
      blockNumber: string;
      from: string;
      gas: string;
      gasPrice: string;
      hash: string;
      input: string;
      nonce: string;
      to: string;
      transactionIndex: string;
      value: string;
      v: string;
      r: string;
      s: string;
    }

    export interface ITransactionReceiptResult {
      transactionHash: string;
      transactionIndex: string;
      blockHash: string;
      blockNumber: string;
      from: string;
      to: string;
      cumulativeGasUsed: string;
      gasUsed: string;
      contractAddress: string;
      logs: ILogResult[];
      logsBloom: string;
      status: string;
    }

    export interface ILogResult {
      removed: boolean;
      logIndex: string;
      transactionIndex: string;
      transactionHash: string;
      blockHash: string;
      blockNumber: string;
      address: string;
      data: string;
      topics: string[];
    }
  }

  export interface ISendTransactionOptions {
    from: string;
    to?: string;
    gas?: TQuantity;
    gasPrice?: TQuantity;
    value?: TQuantity;
    data?: TData;
    nonce?: TQuantity;
  }

  export interface ICallOptions {
    from?: string;
    to: string;
    gas?: TQuantity;
    gasPrice?: TQuantity;
    value?: TQuantity;
    data?: TData;
  }

  export interface ILogOptions {
    fromBlock?: TTagOrQuantity;
    toBlock?: TTagOrQuantity;
    address?: string | string[];
    topics?: string[];
  }

  export interface IBlockResult {
    hash: string;
    number: number;
    gasLimit: number;
    gasUsed: number;
  }

  export interface IBlockResultWithTransactions<T = any> extends IBlockResult {
    transactions: T[];
  }

  export interface ITransactionResult {
    blockHash: string;
    blockNumber: number;
    hash: string;
    index: number;
    from: string;
    to: string;
    gas: number;
    gasPrice: BN;
    input: string;
    value: BN;
  }

  export interface ITransactionReceiptResult {
    cumulativeGasUsed: number;
    gasUsed: number;
    contractAddress: string;
    logs: ILogResult[];
    success: boolean;
  }

  export interface ILogResult {
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    index: number;
    address: string;
    data: string;
    topics: string[];
  }
}
