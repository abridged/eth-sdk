import { Subject } from 'rxjs';
import { IProvider } from './interfaces';

export class RootProvider implements IProvider {
  private currentProvider: IProvider;

  private extensions: RootProvider.TExtension[] = [];

  public get connected$(): Subject<boolean> {
    return this.innerProvider.connected$;
  }

  public get notification$(): Subject<IProvider.INotification> {
    return this.innerProvider.notification$;
  }

  public addExtension(...extensions: RootProvider.TExtension[]): this {
    this.extensions.push(
      ...extensions,
    );
    return this;
  }

  public addExtensions(...extensions: RootProvider.TExtension[]): this {
    return this.addExtension(...extensions);
  }

  public removeExtension(...extensions: RootProvider.TExtension[]): this {
    this.extensions = this.extensions.filter(extension => !extensions.includes(extension));
    return this;
  }

  public removeExtensions(...extensions: RootProvider.TExtension[]): this {
    return this.removeExtension(...extensions);
  }

  public set innerProvider(innerProvider: IProvider) {
    this.currentProvider = innerProvider;
  }

  public get innerProvider(): IProvider {
    if (!this.currentProvider) {
      throw new Error('undefined innerProvider');
    }

    return this.currentProvider;
  }

  public send(request: IProvider.IJsonRpcRequest, callback: IProvider.TCallback): void {
    if (!this.extensions.length) {
      this.innerProvider.send(request, callback);
      return;
    }

    (async () => {
      try {
        let result: any = null;

        const { jsonrpc, id, method, params } = request;

        for (let extension of this.extensions) {
          switch (typeof extension) {
            case 'function':
              extension = extension as RootProvider.TRawExtension;
              result = await extension(method, params);
              break;

            case 'object':
              extension = extension as RootProvider.IExtension;
              if (extension && extension.replaceSend) {
                result = await extension.replaceSend(method, params);
              }
              break;
          }

          if (result) {
            break;
          }
        }

        if (result) {
          callback(null, {
            jsonrpc,
            id,
            result,
          });
          return;
        }

        this.innerProvider.send(request, callback);
      } catch (err) {
        callback(err);
      }
    })()
      .catch(() => null);
  }

  public sendAsync(request: IProvider.IJsonRpcRequest): Promise<IProvider.IJsonRpcResponse> {
    return new Promise((resolve, reject) => {
      this.send(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const { error } = response;
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      });
    });
  }
}

export namespace RootProvider {
  export type TExtension = TRawExtension | IExtension;
  export type TRawExtension = (method: string, params: any[]) => Promise<any>;

  export interface IExtension {
    replaceSend(method: string, params: any[]): Promise<any>;
  }
}
