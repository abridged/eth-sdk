import {
  Eth,
  Net,
  Subscription,
} from './modules';
import {
  RootProvider,
  HttpProvider,
  WebSocketProvider,
  IProvider,
} from './providers';
import {
  IQuery,
} from './interfaces';

export class Query implements IQuery {
  public static defaultInstance: Query = null;

  public static JSON_RPC_VERSION = '2.0';

  private static REQUEST_COUNTER = Date.now();

  public readonly eth: Eth;
  public readonly net: Net;
  public readonly subscription: Subscription;

  public readonly currentProvider = new RootProvider();

  constructor(
    innerProvider: IProvider | string,
  ) {
    this.eth = new Eth(this);
    this.net = new Net(this);
    this.subscription = new Subscription(this);

    if (typeof innerProvider === 'string') {
      innerProvider = innerProvider as string;
      switch (innerProvider.slice(0, 2)) {
        case 'ht':
          innerProvider = new HttpProvider(innerProvider);
          break;

        case 'ws':
          innerProvider = new WebSocketProvider(innerProvider);
          break;
      }
    }

    if (!innerProvider) {
      throw Error('invalid provider');
    }

    this.currentProvider.innerProvider = innerProvider as IProvider;

    if (!Query.defaultInstance) {
      Query.defaultInstance = this;
    }
  }

  public async send<T = any>(method: string, ...params: any[]): Promise<T> {
    Query.REQUEST_COUNTER += 1;

    const request: IProvider.IJsonRpcRequest = {
      method,
      params,
      jsonrpc: Query.JSON_RPC_VERSION,
      id: Query.REQUEST_COUNTER,
    };

    const response = await this.currentProvider.sendAsync(request);

    const { id, result } = response;

    if (id !== request.id) {
      throw new Error('invalid response');
    }

    return result;
  }
}
