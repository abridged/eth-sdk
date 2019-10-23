import { encodePacked, TEncodedPackedArg } from './abi';
import { keccak256 } from './keccak';

export const sha3 = keccak256;

export function soliditySha3(...args: TEncodedPackedArg[]): string {
  return keccak256(
    encodePacked(...args),
  );
}
