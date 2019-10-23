import HDNode from 'hdkey';
import {
  mnemonicToSeedSync,
} from 'bip39';
import { IQuery, WithQuery, queryProviders } from '@eth-sdk/query';
import {
  toHex,
  randomPrivateKey,
  verifyPrivateKey,
  publicKeyToAddress,
  privateToPublicKey,
  signPersonalMessage,
  TData,
} from '@eth-sdk/utils';

export class Key extends WithQuery implements queryProviders.RootProvider.IExtension {
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

      if (query) {

      }
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
        break;

      default:
        throw new Error('invalid key');
    }

    return result;
  }

  public replaceSend(method: string, params: any[]): Promise<any> {
    let result: any = null;

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
}
