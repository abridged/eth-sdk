import { Subject } from 'rxjs';
import { queryModules } from '@eth-sdk/query';
import { TTagOrQuantity } from '@eth-sdk/utils';

export interface IContract<F = null, E = null, K = E extends null ? string : keyof E> {
  address: string;
  allEvents: E extends null ? IContract.IEvent : IContract.IEvent<K>;
  events: E extends null ? {
    [key: string]: IContract.IEvent & IContract.ISignature;
  } : {
    [K in keyof E]: IContract.IEvent<K, E[K]> & IContract.ISignature;
  };
  methods: F extends null ? {
    [key: string]: IContract.TMethod & IContract.ISignature;
  } : {
    [K in keyof F]: F[K] & IContract.ISignature;
  };
}

export namespace IContract {
  export interface ISignature {
    signature: string;
  }

  export interface IEvent<E = string, P = any> {
    getLogs(options?: IEventGetLogsOptions): Promise<IEventLog<E, P>[]>;

    subscribeLogs(): Promise<Subject<IEventLog<E, P>>>;
  }

  export interface IEventLog<E = string, P = any> extends queryModules.Eth.ILogResult {
    event: E;
    payload: P;
  }

  export interface IEventGetLogsOptions {
    fromBlock?: TTagOrQuantity;
    toBlock?: TTagOrQuantity;
  }

  export type TMethod = (...args: any[]) => IMethodExecute;

  export interface IMethodExecute<T = any> {
    data: string;

    call(options?: Partial<queryModules.Eth.ICallOptions>): Promise<T>;

    estimate(options?: Partial<queryModules.Eth.ICallOptions>): Promise<number>;

    send(options?: Partial<queryModules.Eth.ISendTransactionOptions>): Promise<string>;
  }
}
