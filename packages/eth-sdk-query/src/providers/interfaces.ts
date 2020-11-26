// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Subject} from 'rxjs';

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
