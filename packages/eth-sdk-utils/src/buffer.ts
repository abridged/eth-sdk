import { BUFFER_TEXT_ENCODING } from './constants';
import { isHex } from './hex';

export function toBuffer(value: string | Buffer, defaultValue: Buffer = Buffer.alloc(0)): Buffer {
  let result: Buffer = null;

  if (value) {
    switch (typeof value) {
      case 'string':
        value = value as string;

        result = isHex(value, 'data')
          ? Buffer.from(value.slice(2), 'hex')
          : Buffer.from(value, BUFFER_TEXT_ENCODING);
        break;

      case 'object':
        if (Buffer.isBuffer(value)) {
          result = value;
        }
        break;
    }
  }

  return result || defaultValue;
}
