// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {randomHex} from './hex';
import {
  randomPrivateKey,
  privateToPublicKey,
  publicKeyToAddress,
} from './secp256k1';
import {
  signPersonalMessage,
  recoverAddressFromPersonalMessage,
} from './personalMessage';

test('recoverAddressFromPersonalMessage', () => {
  const privateKey = randomPrivateKey();
  const publicKey = privateToPublicKey(privateKey);
  const address = publicKeyToAddress(publicKey);
  const message = randomHex(128);
  const signature = signPersonalMessage(message, privateKey);

  expect(recoverAddressFromPersonalMessage(message, signature)).toBe(address);
});
