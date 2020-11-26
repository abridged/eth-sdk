// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Eth, Net, Subscription} from './modules';
import {RootProvider} from './providers';

export interface IQuery {
  readonly eth: Eth;
  readonly net: Net;
  readonly subscription: Subscription;

  readonly currentProvider: RootProvider;

  send<T = any>(method: string, ...params: any[]): Promise<T>;
}
