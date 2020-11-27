// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {toNumber} from '@eth-sdk/utils';
import {IQuery} from '../interfaces';

export class Net {
  constructor(private query: IQuery) {
    //
  }

  public get version(): Promise<number> {
    return this.query
      .send(Net.Methods.Version)
      .then(result => toNumber(result));
  }
}

export namespace Net {
  export enum Methods {
    Version = 'net_version',
  }
}
