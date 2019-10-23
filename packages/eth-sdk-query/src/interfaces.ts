import { Eth, Net, Subscription } from './modules';
import { RootProvider } from './providers';

export interface IQuery {
  readonly eth: Eth;
  readonly net: Net;
  readonly subscription: Subscription;

  readonly currentProvider: RootProvider;

  send<T = any>(method: string, ...params: any[]): Promise<T>;
}
