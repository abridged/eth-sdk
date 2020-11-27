// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {encode} from './encode';

function createTest({
  types,
  values,
  expected,
}: {
  types: string[];
  values: any[];
  expected: string;
}): void {
  test(types.join(','), () => {
    const encoded = encode(
      types.map(type => ({
        type,
        name: 'any',
      })),
      values,
    );

    expect(encoded).toBe(`0x${expected}`);
  });
}

describe('abi.encode', () => {
  createTest({
    types: ['address'],
    values: ['0x407D73d8a49eeb85D32Cf465507dd71d507100c1'],
    expected:
      '000000000000000000000000407d73d8a49eeb85d32cf465507dd71d507100c1',
  });

  createTest({
    types: ['address[]'],
    values: [
      [
        '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
        '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
      ],
    ],
    expected:
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '000000000000000000000000407d73d8a49eeb85d32cf465507dd71d507100c1' +
      '000000000000000000000000407d73d8a49eeb85d32cf465507dd71d507100c1',
  });

  // see: https://solidity.readthedocs.io/en/v0.5.12/abi-spec.html#use-of-dynamic-types
  createTest({
    types: ['uint', 'uint32[]', 'bytes10', 'bytes'],
    values: ['0x123', ['0x456', '0x789'], '1234567890', 'Hello, world!'],
    expected:
      '0000000000000000000000000000000000000000000000000000000000000123' +
      '0000000000000000000000000000000000000000000000000000000000000080' +
      '3132333435363738393000000000000000000000000000000000000000000000' +
      '00000000000000000000000000000000000000000000000000000000000000e0' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0000000000000000000000000000000000000000000000000000000000000456' +
      '0000000000000000000000000000000000000000000000000000000000000789' +
      '000000000000000000000000000000000000000000000000000000000000000d' +
      '48656c6c6f2c20776f726c642100000000000000000000000000000000000000',
  });
});
