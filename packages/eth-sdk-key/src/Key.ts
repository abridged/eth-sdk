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
  toChecksumAddress, toBuffer, toNumber,
} from '@eth-sdk/utils';
import { Transaction } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';

export class Key extends WithQuery implements queryProviders.IProviderExtension {
  private static DEFAULT_HD_PATH = 'm/44\'/60\'/0\'/0';

  private nonce: number = null;

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

  private currentAddress: string;

  constructor(public privateKey: string = null, query: IQuery = null) {
    super(query);

    if (privateKey) {
      if (!verifyPrivateKey(privateKey)) {
        throw new Error('invalid private key');
      }

      this.currentAddress = publicKeyToAddress(
        privateToPublicKey(privateKey),
      );

      this.type = Key.Types.Local;
    } else if (query) {

      this.type = Key.Types.Network;
    }
  }

  public get address(): string {
    return this.currentAddress;
  }

  public async fetchAddress(index: number = 0): Promise<void> {
    if (this.type === Key.Types.Network) {
      const addresses = await this.query.eth.accounts;
      const address = toChecksumAddress(addresses[index]);

      this.currentAddress = address;
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
          this.address,
          toHex(message),
        );
        break;

      default:
        throw new Error('invalid private key');
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
        gas,
      } = options;

      if (!nonce) {
        nonce = await this.query.eth.getTransactionCount(this.address, 'pending');

        if (this.nonce !== null && this.nonce >= nonce) {
          nonce = this.nonce + 1;
        }

        this.nonce = nonce;
      } else {
        this.nonce = toNumber(nonce);
      }

      if (!gasPrice) {
        gasPrice = await this.query.eth.gasPrice;
      }

      if (!gas) {
        gas = 21000;
      }

      const chainId = await this.query.eth.chainId;
      const networkId = await this.query.net.version;

      let common: Common = null;
      try {
        common = new Common(chainId, 'istanbul');
      } catch (err) {
        common = Common.forCustomChain(1, {
          chainId,
          networkId,
          comment: 'Custom chain',
        }, 'istanbul');
      }

      const transaction = new Transaction({
        to,
        nonce: toHex(nonce, '0x00', true),
        gasLimit: toHex(gas, '0x00', true),
        gasPrice: toHex(gasPrice, '0x00', true),
        value: toHex(value, '0x00', true),
        data: toHex(data, '0x'),
      }, {
        common,
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
          result = [this.address];
          break;
        }

        case queryModules.Eth.Methods.Sign: {
          let address: string;
          let data: string;

          ([address, data] = params);

          address = toChecksumAddress(address);

          if (address === this.address) {
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
            gas,
            gasPrice,
          } = options;

          if (from === this.address) {

            const raw = await this.signTransaction({
              to,
              nonce,
              data,
              value,
              gas,
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
    gas?: TQuantity;
    gasPrice?: TQuantity;
    to: string;
    value?: TQuantity;
    data?: TData;
  }
}
