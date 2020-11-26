import {HEX_PREFIX} from './constants';
import {isHex, getHexBytesSize, concatHex, randomHex} from './hex';
import {keccak256} from './keccak';

export function randomAddress(): string {
  return toChecksumAddress(randomHex(20));
}

export function isAddress(value: string): boolean {
  return isHex(value, 'data') && getHexBytesSize(value) === 20;
}

export function toChecksumAddress(address: string): string {
  let result: string = null;

  if (isAddress(address)) {
    address = address.toLowerCase();

    address = address.slice(2);
    const hash = keccak256(address).slice(2);

    const chars = address
      .split('')
      .map((char, index) =>
        parseInt(hash[index], 16) >= 8 ? char.toUpperCase() : char,
      );

    result = `${HEX_PREFIX}${chars.join('')}`;
  }

  return result;
}

export function computeCreate2Address(
  creator: string,
  salt: string,
  byteCode: string,
): string {
  let result: string = null;

  if (isAddress(creator) && isHex(salt, 'data') && isHex(byteCode, 'data')) {
    if (getHexBytesSize(byteCode) !== 32) {
      byteCode = keccak256(byteCode);
    }

    const payload = concatHex('0xff', creator, salt, byteCode);

    const address = `${HEX_PREFIX}${keccak256(payload).slice(2).slice(-40)}`;

    result = toChecksumAddress(address);
  }

  return result;
}
