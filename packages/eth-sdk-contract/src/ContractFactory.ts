import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IQuery, WithQuery, queryModules } from '@eth-sdk/query';
import { abi, keccak256, concatHex, isAddress, toChecksumAddress } from '@eth-sdk/utils';
import { IContract } from './interfaces';

export class ContractFactory<T = null, E = null> extends WithQuery {
  private static buildSignature(methodName: string, params: abi.IItemParam[]): string {
    return keccak256(`${methodName}(${params.map(({ type }) => type).join(',')})`);
  }

  private hasEvents = false;
  private hasFallback = false;

  private eventConfigs = {
    nameMap: new Map<string, ContractFactory.IEventConfig>(),
    signatureMap: new Map<string, ContractFactory.IEventConfig>(),
  };

  private methodConfigs = {
    nameMap: new Map<string, ContractFactory.IMethodConfig>(),
    signatureMap: new Map<string, ContractFactory.IMethodConfig>(),
  };

  constructor(
    public abiItems: abi.TItems,
    query: IQuery = null,
  ) {
    super(query);

    for (const abiItem of abiItems) {
      const { type, constant, name, inputs, outputs, payable } = abiItem;

      switch (type) {
        case 'event': {
          const signature = ContractFactory.buildSignature(name, inputs);
          const eventConfig: ContractFactory.IEventConfig = {
            name,
            signature,
            inputs: {
              indexed: inputs.filter(({ indexed }) => indexed),
              nonIndexed: inputs.filter(({ indexed }) => !indexed),
            },
          };

          this.eventConfigs.nameMap.set(name, eventConfig);
          this.eventConfigs.signatureMap.set(signature, eventConfig);
          this.hasEvents = true;
          break;
        }

        case 'function': {
          const signature = ContractFactory.buildSignature(name, inputs).slice(0, 10);
          const methodConfig: ContractFactory.IMethodConfig = {
            name,
            signature,
            outputs,
            inputs,
            constant: !!constant,
            payable: !!payable,
          };

          this.methodConfigs.nameMap.set(name, methodConfig);
          this.methodConfigs.signatureMap.set(signature, methodConfig);
          break;
        }

        case 'fallback': {
          this.hasFallback = true;
          break;
        }
      }
    }
  }

  public getInstance(address: string = null): IContract<T, E> {
    const result: IContract = {
      address,
      allEvents: null,
      events: {},
      methods: {},
    };

    const eventConfigs = this.eventConfigs.nameMap.values();
    const methodConfigs = this.methodConfigs.nameMap.values();

    const prepareAddress = (alternative: string = null) => {
      const address = toChecksumAddress(alternative || result.address);

      if (!isAddress(address)) {
        throw new Error('invalid contract address');
      }

      return address;
    };

    const prepareEventLog: (log: queryModules.Eth.ILogResult) => IContract.IEventLog = (log) => {
      let event: any = null;
      let payload: any = {};

      let { topics } = log;
      let signature: string;
      ([signature, ...topics] = topics);

      const eventConfig = this.eventConfigs.signatureMap.get(signature);

      if (eventConfig) {
        const { name, inputs: { indexed, nonIndexed } } = eventConfig;
        const { data } = log;

        event = name;

        if (indexed.length) {
          payload = {
            ...payload,
            ...abi.decode(indexed, concatHex(...topics)),
          };
        }
        if (nonIndexed.length) {
          payload = {
            ...payload,
            ...abi.decode(nonIndexed, data),
          };
        }
      }

      return {
        ...log,
        event,
        payload,
      };
    };

    const createEvent: (topic?: string) => IContract.IEvent = (topic: string = null) => {
      const topics: string[] = topic ? [topic] : [];

      return {
        getLogs: async (options: IContract.IEventGetLogsOptions = {}) => {
          const logs = await this.query.eth.getLogs({
            ...options,
            topics,
            address: prepareAddress(),
          });
          return logs.map(log => prepareEventLog(log));
        },
        subscribeLogs: async () => {
          const result = new Subject<IContract.IEventLog>();
          const subject = await this.query.subscription.create(
            queryModules.Subscription.Types.Logs, {
              topics,
              address: prepareAddress(),
            },
          );

          subject
            .pipe(
              map(log => prepareEventLog(log)),
            )
            .subscribe(result);

          return result;
        },
      };
    };

    result.allEvents = createEvent();

    // build events
    for (const eventConfig of eventConfigs) {
      const { name, signature } = eventConfig;

      result.events[name] = {
        signature,
        ...createEvent(signature),
      };
    }

    // build methods
    for (const methodConfig of methodConfigs) {
      const { name, signature, inputs, constant, outputs } = methodConfig;

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
              to: prepareAddress(to),
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
              to: prepareAddress(to),
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
              to: prepareAddress(to),
            });
          },
        };
      };

      method.signature = signature;

      result.methods[name] = method;
    }

    return result as any;
  }
}

export namespace ContractFactory {
  export interface IEventConfig {
    name: string;
    signature: string;
    inputs: {
      indexed: abi.IItemInput[],
      nonIndexed: abi.IItemInput[],
    };
  }

  export interface IMethodConfig {
    name: string;
    constant: boolean;
    payable: boolean;
    signature: string;
    inputs: abi.IItemInput[];
    outputs: abi.IItemParam[];
  }
}
