import { BehaviorSubject, throwError, from } from 'rxjs';
import { filter, timeoutWith, mergeMap, take, tap, map } from 'rxjs/operators';
import { IProvider } from './interfaces';

export class WebSocketProvider implements IProvider {
  public static DEFAULT_RECONNECT_TIME = 5000;
  public static DEFAULT_REQUEST_TIMEOUT = 3000;

  public connected$ = new BehaviorSubject<boolean>(null);
  public notification$ = new BehaviorSubject<IProvider.INotification>(null);
  public state$ = new BehaviorSubject<WebSocketProvider.States>(null);
  public error$ = new BehaviorSubject<any>(null);

  private readonly webSocketConstructor: WebSocketProvider.IWebSocketConstructor;
  private readonly options: WebSocketProvider.IOptions;
  private connection: WebSocket;

  private pendingRequests: IProvider.IJsonRpcRequest[] = [];
  private request$ = new BehaviorSubject<IProvider.IJsonRpcRequest>(null);
  private response$ = new BehaviorSubject<IProvider.IJsonRpcResponse>(null);
  private reconnectTimeout: any = null;

  constructor(
    private endpoint: string,
    options: WebSocketProvider.IOptions = {},
  ) {
    this.webSocketConstructor = typeof WebSocket !== 'undefined'
      ? WebSocket
      : options.webSocketConstructor;

    if (!this.webSocketConstructor) {
      throw new Error('please setup options.webSocketConstructor');
    }

    this.options = {
      connect: false,
      reconnectTime: WebSocketProvider.DEFAULT_RECONNECT_TIME,
      requestTimeout: WebSocketProvider.DEFAULT_REQUEST_TIMEOUT,
      ...options,
      webSocketConstructor: null,
    };

    this
      .state$
      .pipe(
        map(state => state === WebSocketProvider.States.Connected),
        filter(value => value !== this.connected$.getValue()),
      )
      .subscribe(this.connected$);

    this
      .state$
      .pipe(
        filter(state => state === WebSocketProvider.States.Connected),
        mergeMap(() => from(this.pendingRequests.slice(0, this.pendingRequests.length))),
      )
      .subscribe(this.request$);

    this
      .request$
      .pipe(
        filter(request => !!request),
        tap((request) => {
          this.connection.send(JSON.stringify(request));
        }),
      )
      .subscribe();

    this.messageHandler = this.messageHandler.bind(this);
    this.closeHandler = this.closeHandler.bind(this);
    this.errorHandler = this.errorHandler.bind(this);

    if (this.options.connect) {
      this.connect();
    }
  }

  public get connected(): boolean {
    return this.state === WebSocketProvider.States.Connected;
  }

  public get state(): WebSocketProvider.States {
    return this.state$.getValue();
  }

  public get error(): any {
    return this.error$.getValue();
  }

  public send(request: IProvider.IJsonRpcRequest, callback: IProvider.TCallback): void {
    if (!this.state) {
      this.connect();
    }

    if (this.connected) {
      this.request$.next(request);
    } else {
      this.pendingRequests.push(request);
    }

    const { requestTimeout } = this.options;
    const { id } = request;

    this
      .response$
      .pipe(
        filter(response => response && id === response.id),
        take(1),
        timeoutWith(requestTimeout, throwError(
          new Error('request timeout ...'),
        )),
      )
      .subscribe({
        error: err => callback(err),
        next: response => callback(null, response),
      });
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (this.state) {
        case WebSocketProvider.States.Connected:
          this.removeHandlers();
          try {
            this.connection.close();
            this.state$.next(WebSocketProvider.States.Disconnected);
            resolve();
          } catch (err) {
            reject(err);
          }
          break;

        case WebSocketProvider.States.Disconnected:
          this.cancelReconnect();
          this.removeHandlers();
          resolve();
          break;

        case WebSocketProvider.States.Connecting:
          this.state$.next(WebSocketProvider.States.Disconnecting);
          break;
      }
    });
  }

  private connect(): void {
    this.state$.next(WebSocketProvider.States.Connecting);

    let removeConnectHandlers: (err?: any) => any;

    const openHandler = () => removeConnectHandlers();
    const errorHandler = (err: any) => removeConnectHandlers(err);

    removeConnectHandlers = (err) => {
      this.connection.removeEventListener('open', openHandler);
      this.connection.removeEventListener('error', errorHandler);

      switch (this.state) {
        case WebSocketProvider.States.Connecting:
          if (err) {
            this.state$.next(WebSocketProvider.States.Disconnected);
            this.reconnect();
          } else {
            this.state$.next(WebSocketProvider.States.Connected);
            this.addHandlers();
          }
          break;
        case WebSocketProvider.States.Disconnecting: // force close
          try {
            this.connection.close();
          } catch (err) {
            //
          }
          break;
      }

    };

    this.connection = new this.webSocketConstructor(this.endpoint);
    this.connection.addEventListener('open', openHandler);
    this.connection.addEventListener('error', errorHandler);
  }

  private reconnect(): void {
    const { reconnectTime } = this.options;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, reconnectTime);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private addHandlers(): void {
    this.connection.addEventListener('message', this.messageHandler);
    this.connection.addEventListener('close', this.closeHandler);
    this.connection.addEventListener('error', this.errorHandler);
  }

  private removeHandlers(): void {
    this.connection.removeEventListener('message', this.messageHandler);
    this.connection.removeEventListener('close', this.closeHandler);
    this.connection.removeEventListener('error', this.errorHandler);
  }

  private messageHandler({ data }: WebSocketEventMap['message']): void {
    try {
      const parsed: any = JSON.parse(data);
      const { id } = parsed as IProvider.IJsonRpcResponse;

      if (id) {
        this.response$.next(parsed);
      } else {

        const { method, params } = parsed as IProvider.IJsonRpcSubscription;
        if (method === 'eth_subscription') {
          this.notification$.next(params);
        }
      }
    } catch (err) {
      this.error$.next(err);
    }
  }

  private closeHandler(): void {
    this.removeHandlers();
    this.state$.next(WebSocketProvider.States.Disconnected);
    this.reconnect();
  }

  private errorHandler(err): void {
    this.error$.next(err);
    try {
      this.connection.close();
    } catch (err) {
      this.error$.next(err);
    }
  }
}

export namespace WebSocketProvider {
  export interface IWebSocketConstructor {
    new(url: string, protocols?: string | string[]): WebSocket;
  }

  export interface IOptions {
    webSocketConstructor?: any;
    connect?: boolean;
    reconnectTime?: number;
    requestTimeout?: number;
  }

  export enum States {
    Connecting = 'Connecting',
    Connected = 'Connected',
    Disconnecting = 'Disconnecting',
    Disconnected = 'Disconnected',
  }
}
