import {Subject} from 'rxjs';
import {map, filter} from 'rxjs/operators';
import {IQuery} from '../interfaces';
import {Eth} from './Eth';

export class Subscription {
  public log$ = new Subject<Subscription.ILog>();

  private root: any = null;
  private subjectsMap = new Map<string, Subscription.ISubject>();

  constructor(private query: IQuery) {
    //
  }

  public async create<T extends Subscription.TTypesKeys>(
    type: T,
    options: Subscription.IOptions[T] = null,
  ): Promise<Subscription.ISubject<Subscription.IResult[T]>> {
    let result: Subscription.ISubject = null;

    const params: any[] = [type, options];

    const id = await this.createSubscriptionId(params);

    if (id) {
      result = new Subject<any>() as any;
      result.id = id;
      result.params = params;

      this.query.currentProvider.notification$
        .pipe(
          filter(
            notification =>
              notification && notification.subscription === result.id,
          ),
          map(notification => {
            let result: any = null;

            const {result: raw} = notification;

            switch (type) {
              case Subscription.Types.NewHeads:
                result = Eth.prepareBlockResult(raw);
                break;

              case Subscription.Types.Logs:
                result = Eth.prepareLogResult(raw);
                break;

              case Subscription.Types.NewPendingTransactions:
                result = raw;
                break;
            }

            return result;
          }),
          filter(result => !!result),
        )
        .subscribe(result);

      result.unsubscribe = async () => {
        result.complete();
        this.subjectsMap.delete(id);
        await this.destroySubscriptionId(result.id);
      };

      if (!this.root) {
        this.root = this.query.currentProvider.connected$
          .pipe(filter(value => !!value))
          .subscribe(() =>
            this.resubscribeAll(false).catch(err => {
              this.log$.next({
                type: Subscription.LogTypes.Error,
                data: err,
              });
            }),
          );
      }

      this.subjectsMap.set(result.id, result);
    }

    return result;
  }

  public async resubscribeAll(unsubscribe = true): Promise<void> {
    const iterator = this.subjectsMap.values();

    for (const subject of iterator) {
      if (unsubscribe) {
        await this.destroySubscriptionId(subject.id);
      }

      subject.id = await this.createSubscriptionId(subject.params);
    }
  }

  public async unsubscribeAll(): Promise<void> {
    const iterator = this.subjectsMap.values();

    for (const subject of iterator) {
      await subject.unsubscribe();
    }
  }

  private async createSubscriptionId(params: any[]): Promise<string> {
    const result = this.query.send<string>(
      Eth.Methods.Subscribe,
      ...params.filter(value => !!value),
    );

    this.log$.next({
      type: Subscription.LogTypes.Subscribed,
      data: result,
    });

    return result;
  }

  private async destroySubscriptionId(id: string): Promise<void> {
    await this.query.send<string>(Eth.Methods.Unsubscribe, id);

    this.log$.next({
      type: Subscription.LogTypes.Unsubscribed,
      data: id,
    });
  }
}

export namespace Subscription {
  export interface ISubject<T = any> extends Subject<T> {
    id: string;
    params: any[];
    unsubscribe: () => Promise<void>;
  }

  export enum Types {
    NewHeads = 'newHeads',
    Logs = 'logs',
    NewPendingTransactions = 'newPendingTransactions',
  }

  export interface IOptions {
    [Types.NewHeads]: null;
    [Types.Logs]: {
      address?: string | string[];
      topics?: string | string[];
    };
    [Types.NewPendingTransactions]: null;
  }

  export interface IResult {
    [Types.NewHeads]: Eth.IBlockResult;
    [Types.Logs]: Eth.ILogResult;
    [Types.NewPendingTransactions]: string;
  }

  export type TTypesKeys = keyof IOptions;

  export interface ILog {
    type: LogTypes;
    data: any;
  }

  export enum LogTypes {
    Error = 'Error',
    Subscribed = 'Subscribed',
    Unsubscribed = 'Unsubscribed',
  }
}
