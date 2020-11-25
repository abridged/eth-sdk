import { ecdsaSign, ecdsaRecover } from 'secp256k1';
import { toBuffer } from './buffer';
import { concatHex, toHex, getHexBytesSize, padHexLeft } from './hex';
import { keccak256 } from './keccak';
import { publicKeyToAddress, verifyPublicKey } from './secp256k1';
import { TData } from './types';

export function hashPersonalMessage(message: TData): string {
  const hex = toHex(message);
  const size = getHexBytesSize(hex);

  return keccak256(
    `\x19Ethereum Signed Message:\n${size}`,
    hex,
  );
}

export function signPersonalMessage(message: TData, privateKey: string): string {
  const messageHash = hashPersonalMessage(message);

  const { recid, signature } = ecdsaSign(toBuffer(messageHash), toBuffer(privateKey));

  return concatHex(
    signature,
    padHexLeft(recid, 1),
  );
}

export namespace signPersonalMessage {
  export interface IResult {
    messageHash: string;
    signature: string;
  }
}

export function recoverPublicKeyFromPersonalMessage(message: TData, signature: string): string {
  const hash = hashPersonalMessage(message);

  const signatureBuff = toBuffer(signature);
  const s = signatureBuff.slice(0, -1);
  const r = signatureBuff[signatureBuff.length - 1];

  let result: string = null;

  try {
    const publicKey = toHex(ecdsaRecover(
      s,
      r,
      toBuffer(hash),
      false,
    ));

    result = verifyPublicKey(publicKey) ? publicKey : null;
  } catch (err) {
    result = null;
  }

  return result;
}

export function recoverAddressFromPersonalMessage(message: TData, signature: string): string {
  const publicKey = recoverPublicKeyFromPersonalMessage(message, signature);

  return publicKey
    ? publicKeyToAddress(publicKey)
    : null;
}
