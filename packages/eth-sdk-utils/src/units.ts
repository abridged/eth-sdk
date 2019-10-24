import BN from 'bn.js';
import { toNumberString } from './number';
import { TQuantity } from './types';

export enum Units {
  Wei = 'Wei',
  Gwei = 'Gwei',
  Eth = 'Eth',
  Ether = 'Ether',
}

const shifts = {
  [Units.Wei]: 0,
  [Units.Gwei]: 9,
  [Units.Eth]: 18,
};

export function toWei(value: TQuantity, unit: Units = Units.Eth): BN {
  let result: BN = null;

  if (unit === Units.Ether) {
    unit = Units.Eth;
  }

  const shift = shifts[unit];

  if (Number.isInteger(shift)) {
    const numberString = toNumberString(value, {
      shift,
    });

    result = new BN(numberString, 10);
  }

  return result;
}

export function toEth(value: TQuantity, unit: Units = Units.Wei, precision = 6): string {
  let result: string = null;

  if (unit === Units.Ether) {
    unit = Units.Eth;
  }

  let shift = shifts[unit];

  if (Number.isInteger(shift)) {
    shift = -(shifts[Units.Eth] - shift);
    result = toNumberString(value, {
      shift,
      precision,
    });
  }

  return result;
}

export {
  toEth as toEther,
};
