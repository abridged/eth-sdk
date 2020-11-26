// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {encodePacked, TEncodedPackedArg} from './abi';
import {keccak256} from './keccak';

export const sha3 = keccak256;

export function soliditySha3(...args: TEncodedPackedArg[]): string {
  return keccak256(encodePacked(...args));
}
