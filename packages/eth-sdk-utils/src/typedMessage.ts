// Copyright Abridged Inc. 2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {recoverTypedSignature_v4, signTypedData_v4} from 'eth-sig-util';
import {toChecksumAddress} from './address';
import {toBuffer} from './buffer';

export function signTypedMessage(message: string, privateKey: string): string {
  return signTypedData_v4(toBuffer(privateKey), {data: JSON.parse(message)});
}

export function recoverAddressFromTypedMessage(
  data: string,
  signature: string,
): string {
  const address: string = recoverTypedSignature_v4({
    data: JSON.parse(data),
    sig: signature,
  });

  return toChecksumAddress(address);
}
