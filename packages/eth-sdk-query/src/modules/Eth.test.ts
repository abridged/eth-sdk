// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {eth} from '../__mocks__';
import {Eth} from './Eth';

describe('Eth', () => {
  test('gasPrice', async () => {
    const gasPrice = await eth.gasPrice;
    expect(gasPrice.toNumber()).toBe(0x09184e72a000);
  });
});
