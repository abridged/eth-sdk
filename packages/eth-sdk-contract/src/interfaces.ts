import { queryModules } from '@eth-sdk/query';

export interface IContract<F = null, E = null> {
  address: string;
  events: E extends null ? {
    [key: string]: IContract.IEvent;
  } : {
    [K in keyof E]: IContract.IEvent<E[K]>;
  };
  methods: F extends null ? {
    [key: string]: IContract.IMethod;
  } : {
    [K in keyof F]: F[K] & IContract.ISignature;
  };
}

export namespace IContract {
  export interface ISignature {
    signature: string;
  }

  export interface IEvent<E = string, P = any> extends ISignature {
    getLogs(): Promise<IEventLog<E, P>[]>;
  }

  export interface IEventLog<E = string, P = any> {
    event: E;
    payload: P;
  }

  export interface IMethod extends ISignature {
    (...args: any[]): IMethodExecute;
  }

  export interface IMethodExecute<T = any> {
    data: string;

    call(options?: Partial<queryModules.Eth.ICallOptions>): Promise<T>;

    send(): Promise<string>;
  }
}
