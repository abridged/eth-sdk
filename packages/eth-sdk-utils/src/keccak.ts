import {keccak_256} from 'js-sha3';
import {toBuffer} from './buffer';
import {HEX_PREFIX} from './constants';
import {TData} from './types';
import {concatHex} from './hex';

export function keccak256(...messages: TData[]): string {
  return `${HEX_PREFIX}${keccak_256(toBuffer(concatHex(...messages)))}`;
}
