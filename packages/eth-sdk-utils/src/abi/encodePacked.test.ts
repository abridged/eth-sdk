// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import BN from 'bn.js';
import {encodePacked} from './encodePacked';

describe('abi.encodePacked', () => {
  test('BN', () => {
    expect(encodePacked(new BN(2))).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    );
  });

  test('number', () => {
    expect(encodePacked(1)).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
  });

  test('string', () => {
    expect(encodePacked('test')).toBe('0x74657374');
  });

  test('string[]', () => {
    expect(() => encodePacked(['test', 'test'])).toThrow();
  });

  test('uint8', () => {
    expect(encodePacked({type: 'uint8', value: 1})).toBe('0x01');
  });

  test('number, uint16', () => {
    expect(encodePacked(1, {type: 'uint8', value: 2})).toBe(
      '0x000000000000000000000000000000000000000000000000000000000000000102',
    );
  });
});
