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
