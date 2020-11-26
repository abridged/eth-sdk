// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import BN from 'bn.js';
import {toBN} from './bn';
import {isEmpty} from './helpers';
import {isHex} from './hex';
import {TQuantity} from './types';

export function toNumber(value: unknown, defaultValue: number = null): number {
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

  return isEmpty(result) ? defaultValue : result;
}

export function toNumberString(
  value: TQuantity,
  options: toNumberString.IOptions = {},
): string {
  let result: string = null;

  switch (typeof value) {
    case 'number':
      value = value as number;
      result = value.toString(10);
      break;

    case 'string':
      value = value as string;
      if (isHex(value, 'quantity')) {
        result = toBN(value).toString(10);
      } else if (/^[0-9]*\.?[0-9]+$/g.test(value)) {
        result = value;
      }
      break;

    case 'object':
      if (BN.isBN(value)) {
        result = value.toString(10);
      }
      break;
  }

  if (result) {
    result = trimNumberString(result);

    const {shift, precision} = options;

    if (shift) {
      if (!result.includes('.')) {
        result = `${result}.0`;
      }

      const extra = '0'.repeat(shift > 0 ? shift : -shift);

      result = `${extra}${result}${extra}`;

      const dotPosition = result.indexOf('.');

      result = result.replace('.', '');

      if (shift > 0) {
        result = [
          result.slice(0, dotPosition + shift),
          result.slice(dotPosition + shift),
        ].join('.');
      } else {
        result = [
          result.slice(0, dotPosition + shift),
          result.slice(dotPosition + shift),
        ].join('.');
      }

      result = trimNumberString(result);
    }

    if (Number.isInteger(precision)) {
      if (!result.includes('.')) {
        if (precision) {
          result = `${result}.${'0'.repeat(precision)}`;
        }
      } else if (!precision) {
        result = result.slice(0, result.indexOf('.'));
      } else {
        const parts = result.split('.');
        const extraCount = parts[1].length - precision;

        if (extraCount > 0) {
          parts[1] = parts[1].substr(0, precision);
        } else if (extraCount < 0) {
          parts[1] = `${parts[1]}${'0'.repeat(-extraCount)}`;
        }

        result = parts.join('.');
      }
    }
  }

  return result;
}

export namespace toNumberString {
  export interface IOptions {
    shift?: number;
    precision?: number;
  }
}

export function trimNumberString(value: string) {
  let result: string = null;

  if (value) {
    const parts = value.split('.');

    parts[0] = parts[0].replace(/^(0+)/g, '');
    parts[1] = (parts[1] || '').replace(/(0+)$/g, '');

    if (!parts[0]) {
      parts[0] = '0';
    }

    if (parts[1]) {
      result = parts.join('.');
    } else {
      result = parts[0];
    }
  }

  return result;
}
