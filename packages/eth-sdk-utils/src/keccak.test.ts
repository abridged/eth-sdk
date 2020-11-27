// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {keccak256} from './keccak';

test('keccak256 hex', () => {
  expect(keccak256('0x010203')).toBe(
    '0xf1885eda54b7a053318cd41e2093220dab15d65381b1157a3633a83bfd5c9239',
  );
  expect(keccak256('0x')).toBe(
    '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
  );
});

test('keccak256 string', () => {
  expect(keccak256('test')).toBe(
    '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
  );
});
