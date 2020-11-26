// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BehaviorSubject} from 'rxjs';
import {IProvider} from './interfaces';

export class HttpProvider implements IProvider {
  private static detectFetch(option: any = null): any {
    let result: any;

    if (option) {
      result = option;
    } else {
      result =
        typeof window !== 'undefined' && typeof window.fetch !== 'undefined'
          ? window.fetch.bind(window)
          : null;
    }

    if (!result) {
      new Error('fetch not found. Please use `node-fetch` via options.fetch');
    }

    return result;
  }

  private readonly fetch: HttpProvider.TFetch;

  constructor(private endpoint: string, options: HttpProvider.IOptions = {}) {
    this.fetch = HttpProvider.detectFetch(options.fetch);
  }

  public get connected$(): BehaviorSubject<boolean> {
    return new BehaviorSubject(false);
  }

  public get notification$(): any {
    throw new Error("HttpProvider doesn't support subscriptions");
  }

  public send(
    request: IProvider.IJsonRpcRequest,
    callback: IProvider.TCallback,
  ): void {
    this.fetch(this.endpoint, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
      .then(res => res.json())
      .then(data => callback(null, data))
      .catch(err => callback(err));
  }
}

export namespace HttpProvider {
  export interface IOptions {
    fetch?: any;
  }

  export type TFetch = (
    input?: Request | string,
    init?: RequestInit,
  ) => Promise<Response>;
}
