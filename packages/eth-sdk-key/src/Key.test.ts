// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/key
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Key} from './Key';

const MNEMONIC =
  'claw wrestle oil zero canvas find glimpse average solar service stock pill';
const ADDRESSES = [
  '0x827c3940A6258EC1eF8f414a8B16a7bFA48Eea0A',
  '0xfA2C5b55450CE4006F337000dFF96020C601d6Bb',
];
const PRIVATE_KEY =
  '0xf6de279eab8eddc97d3db38879222e761db3b4e6d547da905c266db9080932c0';

test('local keys from mnemonic', async () => {
  const keys = Key.createLocalKeysFromMnemonic(MNEMONIC, null, {
    fromIndex: 0,
    toIndex: 1,
  });

  expect(keys.length).toBe(2);
  expect(keys[0].address).toBe(ADDRESSES[0]);
  expect(keys[1].address).toBe(ADDRESSES[1]);
});

test('local key from mnemonic', async () => {
  const key = Key.createLocalKeyFromMnemonic(MNEMONIC, null, {index: 1});

  expect(key.address).toBe(ADDRESSES[1]);
});

test('local key from private key', async () => {
  const key = new Key(PRIVATE_KEY);

  expect(key.address).toBe(ADDRESSES[0]);
});
