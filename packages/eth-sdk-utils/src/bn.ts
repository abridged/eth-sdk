import BN from 'bn.js';
import {isHex} from './hex';

export function toBN(value: any, defaultValue: BN = null): BN {
  let result: BN = null;

  switch (typeof value) {
    case 'number':
      result = new BN(value, 10);
      break;

    case 'string':
      if (isHex(value, 'quantity')) {
        result = new BN(value.slice(2), 16);
      } else {
        result = new BN(value, 10);
      }
      break;

    case 'object':
      if (BN.isBN(value)) {
        result = value;
      }
  }

  return result || defaultValue;
}
