// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {isHex} from './hex';

test('isHex type=quantity', () => {
  expect(isHex('0x101', 'quantity')).toBeTruthy();
  expect(isHex('0x0', 'quantity')).toBeTruthy(); // should always have at least one digit
  expect(isHex('0x01', 'quantity')).toBeFalsy(); // no leading zeroes allowed
  expect(isHex('0x', 'quantity')).toBeFalsy();
});

test('isHex type=data', () => {
  expect(isHex('0x101', 'data')).toBeFalsy(); // must be even number of digits
  expect(isHex('0x', 'data')).toBeTruthy();
});
