import {Eth, Net} from '../modules';
import {IProvider} from '../providers';

/**
 * see: https://github.com/ethereum/wiki/wiki/JSON-RPC
 */
export const provider: IProvider & {
  getMethodResult(method: Net.Methods | Eth.Methods): any;
} = {
  getMethodResult(method: any): any {
    let result: any = null;

    switch (method) {
      // net
      case Net.Methods.Version:
        result = '3';
        break;

      // eth
      case Eth.Methods.GasPrice:
        result = '0x09184e72a000';
        break;
    }

    return result;
  },
  send(
    request: IProvider.IJsonRpcRequest,
    callback: IProvider.TCallback,
  ): void {
    const {method, id, jsonrpc} = request;

    callback(null, {
      id,
      jsonrpc,
      result: this.getMethodResult(method),
    });
  },
};
