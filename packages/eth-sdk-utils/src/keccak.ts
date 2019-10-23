import { keccak_256 } from 'js-sha3';
import { toBuffer } from './buffer';
import { HEX_PREFIX } from './constants';
import { TData } from './types';
import { concatHex, toHex } from './hex';

export function keccak256(...messages: TData[]): string {
  const hashes = messages
    .map(message => `${HEX_PREFIX}${keccak_256(toBuffer(message))}`);

  return concatHex(
    ...hashes.map(hash => toHex(hash)),
  );
}
