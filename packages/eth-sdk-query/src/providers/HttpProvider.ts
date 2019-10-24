import { BehaviorSubject } from 'rxjs';
import { IProvider } from './interfaces';

export class HttpProvider implements IProvider {
  private readonly fetch: HttpProvider.TFetch;

  constructor(
    private endpoint: string,
    options: HttpProvider.IOptions = {},
  ) {
    this.fetch = typeof fetch !== 'undefined'
      ? fetch
      : options.fetch;

    if (!this.fetch) {
      new Error('fetch not found. Please use `node-fetch` via options.fetch');
    }
  }

  public get connected$(): BehaviorSubject<boolean> {
    return new BehaviorSubject(false);
  }

  public get notification$(): any {
    throw new Error('HttpProvider doesn\'t support subscriptions');
  }

  public send(request: IProvider.IJsonRpcRequest, callback: IProvider.TCallback): void {
    this
      .fetch(this.endpoint, {
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

  export type TFetch = (input?: Request | string, init?: RequestInit) => Promise<Response>;
}
