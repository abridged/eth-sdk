import { randomBytes } from 'crypto';
import BN from 'bn.js';
import { BUFFER_TEXT_ENCODING, HEX_PREFIX } from './constants';
import { isEmpty } from './helpers';

export function randomHex(size: number): string {
  return toHex(randomBytes(size));
}

export function getHexBytesSize(value: string) {
  let result: number = 0;
  if (isHex(value, 'data')) {
    result = (value.length - 2) / 2;
  }
  return result;
}

export function concatHex(...values: any[]): string {
  return `${HEX_PREFIX}${values.map(value => toHex(value).slice(2)).join('')}`;
}

export function padHex(value: any, bytes: number, direction: 'left' | 'right'): string {
  let result: string = null;

  const hex = toHex(value);

  if (hex) {
    const length = bytes * 2;
    const base = hex.slice(2);
    if (base.length < length) {
      const pad = '0'.repeat(length - base.length);

      switch (direction) {
        case 'left':
          result = `${pad}${base}`;
          break;

        case 'right':
          result = `${base}${pad}`;
          break;
      }

      result = `${HEX_PREFIX}${result}`;
    } else {
      result = hex;
    }
  }

  return result;
}

export function padHexLeft(value: any, bytes: number = 32): string {
  return padHex(value, bytes, 'left');
}

export function padHexRight(value: any, bytes: number = 32) {
  return padHex(value, bytes, 'right');
}

export function toHex(value: any, defaultValue = '0x', forceEven = false): string {
  let result: string = null;

  if (!isEmpty(value)) {
    if (isHex(value)) {
      result = value;
    } else {
      switch (typeof value) {
        case 'boolean':
          result = value ? '1' : '0';
          break;

        case 'string':
          result = Buffer.from(value, BUFFER_TEXT_ENCODING).toString('hex');
          break;

        case 'number':
          result = value.toString(16);
          break;

        case 'object':
          if (BN.isBN(value)) {
            result = value.toString('hex');
          } else if (Buffer.isBuffer(value)) {
            result = value.toString('hex');
          }
          break;
      }

      if (result) {
        result = `${HEX_PREFIX}${result}`;
      }
    }

    if (result && forceEven && result.length % 2 !== 0) {
      result = `${HEX_PREFIX}0${result.slice(2)}`;
    }
  }

  return result || defaultValue;
}

export function isHex(value: string, type: 'quantity' | 'data' = null): boolean {
  let result = false;

  if (
    value &&
    typeof value === 'string' &&
    value.startsWith(HEX_PREFIX)
  ) {
    value = value.toLowerCase();

    const length = value.length;

    if (
      !type ||
      (type === 'quantity' && length > 2) ||
      (type === 'data' && length % 2 === 0)
    ) {

      if (
        type === 'quantity' &&
        value.charCodeAt(2) === 48
      ) {
        result = length === 3;
      } else {
        result = true;

        for (let i = 2; i < length; i += 1) {
          const charCode = value.charCodeAt(i);

          if (
            !(charCode >= 97 && charCode <= 102) &&
            !(charCode >= 48 && charCode <= 57)
          ) {
            result = false;
            break;
          }
        }
      }
    }
  }

  return result;
}
