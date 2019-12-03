import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { WithQuery, IQuery, queryModules } from '@eth-sdk/query';
import { abi, keccak256, TTagOrQuantity, toChecksumAddress, isAddress, concatHex } from '@eth-sdk/utils';

export class Contract<F = null, E = null, K = E extends null ? string : keyof E> extends WithQuery {
  protected static buildSignature(methodName: string, params: abi.IItemParam[]): string {
    return keccak256(`${methodName}(${params.map(({ type }) => type).join(',')})`);
  }

  public readonly allEvents: E extends null ? Contract.IEvent : Contract.IEvent<K>;

  public readonly events: E extends null ? {
    [key: string]: Contract.IEvent & Contract.IWithSignature;
  } : {
    [K in keyof E]: Contract.IEvent<K, E[K]> & Contract.IWithSignature;
  };

  public readonly methods: F extends null ? {
    [key: string]: Contract.TMethod & Contract.IWithSignature;
  } : {
    [K in keyof F]: F[K] & Contract.IWithSignature;
  };

  protected currentAddress: string;

  protected hasEvents = false;
  protected hasFallback = false;
  protected eventsMap: Contract.IMap<Contract.IMappedEvent>;
  protected methodsMap: Contract.IMap<Contract.IMappedMethod>;

  constructor(
    public abiItems: abi.TItems,
    address: string = null,
    query: IQuery = null,
  ) {
    super(query);

    this.address = address;

    this.eventsMap = {
      names: new Map(),
      signatures: new Map(),
    };

    this.methodsMap = {
      names: new Map(),
      signatures: new Map(),
    };

    for (const abiItem of abiItems) {
      const { type, constant, name, inputs, outputs, payable } = abiItem;

      switch (type) {
        case 'event': {
          const signature = Contract.buildSignature(name, inputs);
          const mappedEvent: Contract.IMappedEvent = {
            name,
            signature,
            inputs: {
              indexed: inputs.filter(({ indexed }) => indexed),
              nonIndexed: inputs.filter(({ indexed }) => !indexed),
            },
          };

          this.hasEvents = true;
          this.eventsMap.names.set(name, mappedEvent);
          this.eventsMap.signatures.set(signature, mappedEvent);
          break;
        }

        case 'function': {
          const signature = Contract.buildSignature(name, inputs).slice(0, 10);
          const mappedMethod: Contract.IMappedMethod = {
            name,
            signature,
            outputs,
            inputs,
            constant: !!constant,
            payable: !!payable,
          };

          this.methodsMap.names.set(name, mappedMethod);
          this.methodsMap.signatures.set(signature, mappedMethod);
          break;
        }

        case 'fallback': {
          this.hasFallback = true;
          break;
        }
      }
    }

    this.allEvents = this.buildEvent() as any;
    this.events = this.buildEvents();
    this.methods = this.buildMethods();
  }

  public get address(): string {
    return this.currentAddress;
  }

  public set address(address: string) {
    this.currentAddress = toChecksumAddress(address);
  }

  public at(address: string): Contract<F, E, K> {
    return new Contract<F, E, K>(
      this.abiItems,
      address,
      this.query,
    );
  }

  protected getAddress(optional: string = null): string {
    const result = this.address || optional;

    if (!isAddress(result)) {
      throw new Error('invalid contract address');
    }

    return result;
  }

  protected buildEvents(): any {
    const result: {
      [key: string]: Contract.IEvent & Contract.IWithSignature;
    } = {};

    const mappedEvents = this.eventsMap.names.values();

    for (const mappedEvent of mappedEvents) {
      const { name, signature } = mappedEvent;

      result[name] = {
        signature,
        ...this.buildEvent(signature),
      };
    }

    return result;
  }

  protected buildMethods(): any {
    const result: {
      [key: string]: Contract.TMethod & Contract.IWithSignature;
    } = {};

    const mappedMethods = this.methodsMap.names.values();

    for (const mappedMethod of mappedMethods) {
      const { name, signature, inputs, constant, outputs } = mappedMethod;

      const method: any = (...args: any[]) => {
        const data = concatHex(
          signature,
          abi.encode(inputs, args),
        );

        return {
          data,
          call: async (options: Partial<queryModules.Eth.ICallOptions> = {}) => {
            if (!constant) {
              throw new Error('call unsupported');
            }

            const { to } = options;

            const output = await this.query.eth.call({
              data,
              to: this.getAddress(to),
            });

            return abi.decode(outputs, output);
          },

          estimate: async (options: Partial<queryModules.Eth.ICallOptions> = {}) => {
            if (constant) {
              throw new Error('estimate unsupported');
            }

            const {
              to,
              from,
              gasPrice,
              gas,
              value,
            } = options;

            return this.query.eth.estimateGas({
              from,
              gas,
              gasPrice,
              value,
              data,
              to: this.getAddress(to),
            });
          },

          send: async (options: Partial<queryModules.Eth.ISendTransactionOptions> = {}) => {
            if (constant) {
              throw new Error('send unsupported');
            }

            const {
              to,
              from,
              gasPrice,
              gas,
              nonce,
              value,
            } = options;

            return this.query.eth.sendTransaction({
              from,
              gas,
              gasPrice,
              nonce,
              value,
              data,
              to: this.getAddress(to),
            });
          },
        };
      };

      method.signature = signature;

      result[name] = method;
    }

    return result;
  }

  protected buildEvent(topic: string = null): Contract.IEvent {
    const topics: string[] = topic ? [topic] : [];

    return {
      getLogs: async (options: Contract.IEventGetLogsOptions = {}) => {
        const logs = await this.query.eth.getLogs({
          ...options,
          topics,
          address: this.getAddress(),
        });
        return logs.map(log => this.prepareEventLog(log));
      },
      subscribeLogs: async () => {
        const result = new Subject<Contract.IEventLog>();
        const subject = await this.query.subscription.create(
          queryModules.Subscription.Types.Logs, {
            topics,
            address: this.address,
          },
        );

        subject
          .pipe(
            map(log => this.prepareEventLog(log)),
          )
          .subscribe(result);

        return result;
      },
    };
  }

  protected prepareEventLog(log: queryModules.Eth.ILogResult): Contract.IEventLog {
    let event: any = null;
    let payload: any = {};

    let { topics } = log;
    let signature: string;
    ([signature, ...topics] = topics);

    const mappedEvent = this.eventsMap.signatures.get(signature);

    if (mappedEvent) {
      const { name, inputs: { indexed, nonIndexed } } = mappedEvent;
      const { data } = log;

      event = name;

      if (indexed.length) {
        payload = abi.decode(indexed, concatHex(...topics), false);
      }
      if (nonIndexed.length) {
        payload = {
          ...payload,
          ...abi.decode(nonIndexed, data, false),
        };
      }
    }

    return {
      ...log,
      event,
      payload,
    };
  }
}

export namespace Contract {
  export interface IMap<T> {
    names: Map<string, T>;
    signatures: Map<string, T>;
  }

  export interface IMappedEvent {
    name: string;
    signature: string;
    inputs: {
      indexed: abi.IItemInput[],
      nonIndexed: abi.IItemInput[],
    };
  }

  export interface IMappedMethod {
    name: string;
    constant: boolean;
    payable: boolean;
    signature: string;
    inputs: abi.IItemInput[];
    outputs: abi.IItemParam[];
  }

  export interface IWithSignature {
    signature: string;
  }

  export interface IEvent<E = string, P = any> {
    getLogs(options?: IEventGetLogsOptions): Promise<IEventLog<E, P>[]>;

    subscribeLogs(): Promise<Subject<IEventLog<E, P>>>;
  }

  export interface IEventLog<E = string, P = any> extends queryModules.Eth.ILogResult {
    event: E;
    payload: P;
  }

  export interface IEventGetLogsOptions {
    fromBlock?: TTagOrQuantity;
    toBlock?: TTagOrQuantity;
  }

  export type TMethod = (...args: any[]) => IMethodExecute;

  export interface IMethodExecute<T = any> {
    data: string;

    call(options?: Partial<queryModules.Eth.ICallOptions>): Promise<T>;

    estimate(options?: Partial<queryModules.Eth.ICallOptions>): Promise<number>;

    send(options?: Partial<queryModules.Eth.ISendTransactionOptions>): Promise<string>;
  }
}
