import BN from 'bn.js';
import { isEmpty } from './helpers';
import { isHex } from './hex';

export function toNumber(value: any, defaultValue: number = null): number {
  let result: number = null;

  switch (typeof value) {
    case 'boolean':
      result = value ? 1 : 0;
      break;

    case 'string':
      if (isHex(value, 'quantity')) {
        result = parseInt(value.slice(2), 16);
      } else {
        result = parseInt(value, 10);
      }
      break;

    case 'number':
      result = value;
      break;

    case 'object':
      if (BN.isBN(value)) {
        result = value.toNumber();
      }
      break;
  }

  return isEmpty(result)
    ? defaultValue
    : result;
}
