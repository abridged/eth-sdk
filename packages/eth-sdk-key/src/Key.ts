import HDNode from 'hdkey';
import {
  mnemonicToSeedSync,
} from 'bip39';
import {
  IQuery,
  WithQuery,
  queryProviders,
  queryModules,
} from '@eth-sdk/query';
import {
  toHex,
  randomPrivateKey,
  verifyPrivateKey,
  publicKeyToAddress,
  privateToPublicKey,
  signPersonalMessage,
  TData,
  TQuantity,
  toChecksumAddress, toBuffer,
} from '@eth-sdk/utils';
import { Transaction } from 'ethereumjs-tx';

export class Key extends WithQuery implements queryProviders.IProviderExtension {
  private static DEFAULT_HD_PATH = 'm/44\'/60\'/0\'/0';

  public static createRandom(query: IQuery = null): Key {
    return new Key(
      randomPrivateKey(),
      query,
    );
  }

  public static createLocalKeyFromMnemonic(mnemonic: string, query: IQuery = null, options: Key.IFromMnemonicOptionsSingle = {}): Key {
    options = {
      hdPath: this.DEFAULT_HD_PATH,
      index: 0,
      ...options,
    };

    const {
      hdPath,
      password,
      index,
    } = options;

    const [result] = this.createLocalKeysFromMnemonic(mnemonic, query, {
      hdPath,
      password,
      fromIndex: index,
      toIndex: index,
    });

    return result || null;
  }

  public static createLocalKeysFromMnemonic(mnemonic: string, query: IQuery = null, options: Key.IFromMnemonicOptionsMany = {}): Key[] {
    const result: Key[] = [];

    options = {
      hdPath: this.DEFAULT_HD_PATH,
      fromIndex: 0,
      toIndex: 9,
      ...options,
    };

    const {
      hdPath,
      password,
      fromIndex,
      toIndex,
    } = options;

    const seed = mnemonicToSeedSync(mnemonic, password);
    const rootHdNode = HDNode.fromMasterSeed(seed);

    for (let index = fromIndex; index <= toIndex; index += 1) {
      const hdNode = rootHdNode.derive(`${hdPath}/${index}`);
      const privateKey = toHex(hdNode.privateKey);

      result.push(
        new Key(privateKey, query),
      );
    }

    return result;
  }

  public readonly type: Key.Types = null;
  public readonly address: Promise<string>;

  constructor(public privateKey: string = null, query: IQuery = null) {
    super(query);

    if (privateKey) {
      if (!verifyPrivateKey(privateKey)) {
        throw new Error('invalid private key');
      }

      this.address = Promise.resolve(publicKeyToAddress(
        privateToPublicKey(privateKey),
      ));

      this.type = Key.Types.Local;
    } else if (query) {
      this.address = this.query.eth.accounts.then(([address]) => address);
      this.type = Key.Types.Network;
    }
  }

  public async signPersonalMessage(message: TData): Promise<string> {
    let result: string = null;

    switch (this.type) {
      case Key.Types.Local:
        result = signPersonalMessage(
          message,
          this.privateKey,
        );
        break;

      case Key.Types.Network:
        result = await this.query.eth.sign(
          await this.address,
          toHex(message),
        );
        break;

      default:
        throw new Error('invalid key');
    }

    return result;
  }

  public async signTransaction(options: Key.ISignTransactionOptions): Promise<string> {
    let result: string = null;

    if (this.type === Key.Types.Local) {
      const {
        to,
        value,
        data,
      } = options;

      let {
        nonce,
        gasPrice,
        gasLimit,
      } = options;

      if (!nonce) {
        nonce = await this.query.eth.getTransactionCount(await this.address, 'pending');
      }

      if (!gasPrice) {
        gasPrice = await this.query.eth.gasPrice;
      }

      if (!gasLimit) {
        gasLimit = 21000;
      }

      const transaction = new Transaction({
        to,
        nonce: toHex(nonce, '0x00', true),
        gasPrice: toHex(gasPrice, '0x00', true),
        gasLimit: toHex(gasLimit, '0x00', true),
        value: toHex(value, '0x00', true),
        data: toHex(data, '0x'),
      });

      transaction.sign(toBuffer(this.privateKey));

      result = toHex(transaction.serialize());
    } else {
      throw new Error('invalid key');
    }

    return result;
  }

  public async extendProvider(method: string, params: any[]): Promise<any> {
    let result: any = null;

    if (this.type === Key.Types.Local) {
      switch (method) {
        case queryModules.Eth.Methods.Accounts: {
          result = [await this.address];
          break;
        }

        case queryModules.Eth.Methods.Sign: {
          let address: string;
          let data: string;

          ([address, data] = params);

          address = toChecksumAddress(address);

          if (address === await this.address) {
            result = await this.signPersonalMessage(data);
          }
          break;
        }

        case queryModules.Eth.Methods.SendTransaction: {
          let options: queryModules.Eth.ISendTransactionOptions;
          ([options] = params);

          const {
            from,
            to,
            data,
            value,
            nonce,
            gas: gasLimit,
            gasPrice,
          } = options;

          if (from === await this.address) {

            const raw = await this.signTransaction({
              to,
              nonce,
              data,
              value,
              gasLimit,
              gasPrice,
            });

            result = await this.query.eth.sendRawTransaction(raw);
          }
          break;
        }
      }
    }

    return result;
  }
}

export namespace Key {
  export enum Types {
    Network = 'Network',
    Local = 'Local',
  }

  export interface IFromMnemonicOptions {
    hdPath?: string;
    password?: string;
  }

  export interface IFromMnemonicOptionsSingle extends IFromMnemonicOptions {
    index?: number;
  }

  export interface IFromMnemonicOptionsMany extends IFromMnemonicOptions {
    fromIndex?: number;
    toIndex?: number;
  }

  export interface ISignTransactionOptions {
    nonce?: TQuantity;
    gasPrice?: TQuantity;
    gasLimit?: TQuantity;
    to: string;
    value?: TQuantity;
    data?: TData;
  }
}
