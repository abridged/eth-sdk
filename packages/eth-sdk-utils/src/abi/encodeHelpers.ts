// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import BN from 'bn.js';
import {isAddress} from '../address';
import {isEmpty} from '../helpers';
import {
  padHexLeft,
  toHex,
  isHex,
  concatHex,
  getHexBytesSize,
  padHexRight,
  padHex,
} from '../hex';
import {parseType} from './sharedHelpers';
import {TType} from './types';
import {IEncodedArg} from './interfaces';

export function detectArgType(arg: any, noArray = false): TType {
  let result: TType = null;

  if (!isEmpty(arg)) {
    switch (typeof arg) {
      case 'boolean':
        result = 'bool';
        break;

      case 'string':
        if (isHex(arg, 'data')) {
          result = 'bytes';
        } else if (isHex(arg, 'quantity')) {
          result = 'uint256';
        } else {
          result = 'string';
        }
        break;

      case 'number':
        result = 'uint256';
        break;

      case 'object':
        if (Array.isArray(arg) && !noArray) {
          if (arg.length === 0) {
            result = 'any[]';
          } else {
            result = detectArgType(arg[0]);

            if (result) {
              for (let i = 1; i < arg.length; i += 1) {
                const type = detectArgType(arg[i], true);
                if (!type || type !== result) {
                  result = null;
                }
              }

              if (result) {
                result = `${result}[]`;
              }
            }
          }
        } else if (BN.isBN(arg)) {
          result = 'uint256';
        } else if (Buffer.isBuffer(arg)) {
          result = 'bytes';
        }
        break;
    }
  }

  return result;
}

function encodeNonArrayArg(
  mainType: TType,
  value: any,
  padBytes = false,
): string {
  let result: string = null;

  if (mainType === 'uint') {
    mainType = 'uint256';
  }

  switch (mainType) {
    case 'address':
      if (!isAddress(value)) {
        throw new Error('invalid address');
      }
      result = (value as string).toLowerCase();
      break;

    case 'bool':
    case 'bytes':
    case 'string':
      result = toHex(value);
      break;

    default:
      const {type, bytes} = parseType(mainType);

      if (bytes > 0) {
        switch (type) {
          case 'bytes':
            if (padBytes) {
              result = padHexRight(value, bytes);
            } else {
              result = value;
            }
            break;

          case 'uint':
            result = padHexLeft(value, bytes);
            break;
        }
      }
  }

  return result;
}

export function encodeArg(arg: IEncodedArg, packed: boolean): string {
  let result: string = null;

  const {type, value} = arg;

  let innerType: TType = null;

  if (type.endsWith('[]')) {
    innerType = type.slice(0, -2);

    switch (innerType) {
      case 'bytes':
      case 'string':
        throw new Error(`${type} not supported`);
    }

    if (!Array.isArray(value)) {
      throw new Error('expected array value');
    }

    const encoded = value.map(innerValue =>
      encodeNonArrayArg(innerType, innerValue, true),
    );

    if (packed) {
      result = concatHex(...encoded);
    } else {
      result = concatHex(
        padHexLeft(toHex(value.length), 32),
        concatHex(...encoded.map(value => padHexLeft(value, 32))),
      );
    }
  } else {
    result = encodeNonArrayArg(type, value, !packed);

    if (result && !packed) {
      switch (type) {
        case 'bytes':
        case 'string':
          result = concatHex(
            padHexLeft(getHexBytesSize(result), 32),
            padHexRight(result, 32),
          );
          break;

        default:
          result = padHex(
            result,
            32,
            type.startsWith('bytes') ? 'right' : 'left',
          );
      }
    }
  }

  return result;
}
