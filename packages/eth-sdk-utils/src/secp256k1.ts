// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {publicKeyVerify, privateKeyVerify, publicKeyCreate} from 'secp256k1';
import {HEX_PREFIX} from './constants';
import {toChecksumAddress} from './address';
import {toBuffer} from './buffer';
import {randomHex, toHex} from './hex';
import {keccak256} from './keccak';

export function verifyPublicKey(publicKey: string): boolean {
  const buffer = toBuffer(publicKey, null);

  return buffer && publicKeyVerify(buffer);
}

export function verifyPrivateKey(privateKey: string): boolean {
  const buffer = toBuffer(privateKey, null);
  return buffer && privateKeyVerify(buffer);
}

export function privateToPublicKey(privateKey: string): string {
  let result: string = null;

  if (verifyPrivateKey(privateKey)) {
    const buffer = toBuffer(privateKey, null);
    result = toHex(publicKeyCreate(buffer, false));
  }

  return result;
}

export function randomPrivateKey(): string {
  let result: string = null;
  for (;;) {
    result = randomHex(32);
    if (verifyPrivateKey(result)) {
      break;
    }
  }

  return result;
}

export function publicKeyToAddress(publicKey: string): string {
  let result: string = null;

  try {
    if (verifyPublicKey(publicKey)) {
      const hash = keccak256(`${HEX_PREFIX}${publicKey.slice(4)}`).slice(2);
      result = toChecksumAddress(`${HEX_PREFIX}${hash.slice(-40)}`);
    }
  } catch (err) {
    result = null;
  }

  return result;
}
