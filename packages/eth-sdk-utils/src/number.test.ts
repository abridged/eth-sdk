// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {toNumberString} from './number';

test('toNumberString', () => {
  expect(
    toNumberString(1, {
      shift: 1,
      precision: 0,
    }),
  ).toBe('10');

  expect(
    toNumberString(0.1, {
      shift: 1,
      precision: 0,
    }),
  ).toBe('1');

  expect(
    toNumberString(10, {
      shift: -1,
      precision: 0,
    }),
  ).toBe('1');

  expect(
    toNumberString(1, {
      shift: 1,
      precision: 2,
    }),
  ).toBe('10.00');

  expect(
    toNumberString(0.1, {
      shift: 1,
      precision: 2,
    }),
  ).toBe('1.00');

  expect(
    toNumberString(10, {
      shift: -1,
      precision: 2,
    }),
  ).toBe('1.00');
});
