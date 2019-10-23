import { Subject } from 'rxjs';

export interface IProvider {
  connected$?: Subject<boolean>;
  notification$?: Subject<IProvider.INotification>;

  send(request: IProvider.IJsonRpcRequest, callback: IProvider.TCallback): void;
}

export namespace IProvider {
  export interface IJsonRpc {
    jsonrpc: string;
  }

  export interface IJsonRpcRequest extends IJsonRpc {
    id: number;
    method: string;
    params: any[];
  }

  export interface IJsonRpcResponse extends IJsonRpc {
    id: number;
    result?: any;
    error?: string;
  }

  export interface IJsonRpcSubscription extends IJsonRpc {
    method: 'eth_subscription';
    params: INotification;
  }

  export interface INotification {
    subscription: string;
    result: any;
  }

  export type TCallback = (err: any, response?: IJsonRpcResponse) => void;
}

export interface IProviderExtension {
  extendProvider(method: string, params: any[]): Promise<any>;
}
