import { IQuery, WithQuery, queryModules } from '@eth-sdk/query';
import { abi, keccak256, concatHex, isAddress, toChecksumAddress } from '@eth-sdk/utils';
import { IContract } from './interfaces';

export class ContractFactory<T = null, E = null> extends WithQuery {
  private static buildSignature(methodName: string, params: abi.IItemParam[]): string {
    return keccak256(`${methodName}(${params.map(({ type }) => type).join(',')})`);
  }

  constructor(
    public abiItems: abi.TItems,
    query: IQuery = null,
  ) {
    super(query);
  }

  public getInstance(address: string = null): IContract<T, E> {
    let hasEvents = false;

    const result: IContract = {
      address: toChecksumAddress(address),
      events: {},
      methods: {},
    };

    for (const abiItem of this.abiItems) {
      const { type, constant, name, inputs, outputs } = abiItem;

      switch (type) {
        case 'event':
          hasEvents = true;
          result.events[name] = {
            getLogs: async () => {
              return [];
            },
            signature: ContractFactory.buildSignature(name, inputs),
          };
          break;

        case 'function':
          const signature = ContractFactory.buildSignature(name, inputs).slice(0, 10);

          const method: any = (...args: any[]) => {
            const data = concatHex(
              signature,
              abi.encode(inputs, args),
            );

            return {
              data,
              call: async (options: Partial<queryModules.Eth.ICallOptions> = {}) => {
                if (!constant) {
                  throw new Error('unsupported');
                }

                let { to } = options;

                if (!to) {
                  to = result.address;
                }

                if (!to || !isAddress(to)) {
                  throw new Error('invalid contract address');
                }

                const output = await this.query.eth.call({
                  to,
                  data,
                });

                return abi.decode(outputs, output);
              },
              estimate: async (options: Partial<queryModules.Eth.ICallOptions> = {}) => {
                if (constant) {
                  throw new Error('unsupported');
                }

                const {
                  from,
                  gasPrice,
                  gas,
                  value,
                } = options;
                let { to } = options;

                if (!to) {
                  to = result.address;
                }

                if (!to || !isAddress(to)) {
                  throw new Error('invalid contract address');
                }

                return this.query.eth.estimateGas({
                  from,
                  to,
                  gas,
                  gasPrice,
                  value,
                  data,
                });
              },
              send: async (options: Partial<queryModules.Eth.ISendTransactionOptions> = {}) => {
                if (constant) {
                  throw new Error('unsupported');
                }

                const {
                  from,
                  gasPrice,
                  gas,
                  nonce,
                  value,
                } = options;
                let { to } = options;

                if (!to) {
                  to = result.address;
                }

                if (!to || !isAddress(to)) {
                  throw new Error('invalid contract address');
                }

                return this.query.eth.sendTransaction({
                  from,
                  to,
                  gas,
                  gasPrice,
                  nonce,
                  value,
                  data,
                });
              },
            };
          };

          method.signature = signature;

          result.methods[name] = method;
          break;

        case 'fallback':
          break;
      }
    }

    return result;
  }
}
