import BN from 'bn.js';
import { toChecksumAddress } from '../address';
import { HEX_PREFIX, BUFFER_TEXT_ENCODING } from '../constants';
import { isHex } from '../hex';
import { parseType } from './sharedHelpers';
import { IItemParam } from './interfaces';
import { TType } from './types';

function decodeNonArrayData(mainType: TType, data: string): any {
  let result: any = null;

  if (mainType === 'uint') {
    mainType = 'uint256';
  }

  if (
    mainType === 'bytes' ||
    mainType === 'string'
  ) {
    const size = parseInt(data.slice(0, 64), 16) * 2;
    result = data.slice(64, 64 + size);

    result = mainType === 'bytes'
      ? `0x${result}`
      : Buffer.from(result, 'hex').toString(BUFFER_TEXT_ENCODING);

  } else {
    switch (mainType) {
      case 'address':
        result = toChecksumAddress(
          `${HEX_PREFIX}${data.slice(24)}`,
        );
        break;

      case 'bool':
        result = !!parseInt(data, 16);
        break;

      default:
        const { type, bytes } = parseType(mainType);

        switch (type) {
          case 'uint':
            result = new BN(data, 16);
            break;

          case 'bytes':
            result = `${HEX_PREFIX}${data.slice(0, bytes * 2)}`;
            break;
        }
    }
  }

  return result;
}

export function decode<T = { [key: string]: any }>(params: IItemParam[], data: string): T {
  let result: { [key: string]: any } = null;

  if (isHex(data, 'data')) {
    result = {};
    data = data.slice(2);

    for (let i = 0; i < params.length; i += 1) {
      const { type, name } = params[i];
      let paramData = data.slice(i * 64, (i + 1) * 64);

      if (
        type === 'string' ||
        type === 'bytes' ||
        type.endsWith('[]')
      ) {
        paramData = data.slice(parseInt(paramData, 16) * 2);
      }

      let value: any = null;

      if (type.endsWith('[]')) {
        const size = parseInt(paramData.slice(0, 64), 16);
        value = [];
        value = value as any[];

        const innerType = type.slice(0, -2);

        if (
          innerType === 'string' ||
          innerType === 'bytes'
        ) {
          throw new Error(`${type} not supported`);
        }

        for (let j = 0; j < size; j += 1) {
          const innerData = paramData.slice((j + 1) * 64, (j + 2) * 64);

          value.push(
            decodeNonArrayData(innerType, innerData),
          );
        }
      } else {
        value = decodeNonArrayData(type, paramData);
      }

      result = {
        ...result,
        [name.startsWith('_') ? name.slice(1) : name]: value,
      };
    }
  }

  return result as any;
}
