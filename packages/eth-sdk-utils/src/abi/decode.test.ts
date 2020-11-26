import BN from 'bn.js';
import {decode} from './decode';
import {IItemParam} from './interfaces';

function createTest({
  prams,
  data,
  expected,
}: {
  prams: IItemParam[];
  data: string;
  expected: any;
}): void {
  test(prams.map(({name, type}) => `${type} ${name}`).join(','), () => {
    const decoded = decode(prams, `0x${data}`);

    expect(JSON.parse(JSON.stringify(decoded))).toEqual(
      JSON.parse(JSON.stringify(expected)),
    );
  });
}

describe('abi.decode', () => {
  createTest({
    prams: [{name: 'a', type: 'address'}],
    data: '000000000000000000000000407d73d8a49eeb85d32cf465507dd71d507100c1',
    expected: {
      a: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
      0: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
      length: 1,
    },
  });

  createTest({
    prams: [{name: 'a', type: 'address[]'}],
    data:
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '000000000000000000000000407d73d8a49eeb85d32cf465507dd71d507100c1' +
      '000000000000000000000000407d73d8a49eeb85d32cf465507dd71d507100c1',
    expected: {
      a: [
        '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
        '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
      ],
      0: [
        '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
        '0x407D73d8a49eeb85D32Cf465507dd71d507100c1',
      ],
      length: 1,
    },
  });

  // see: https://solidity.readthedocs.io/en/v0.5.12/abi-spec.html#use-of-dynamic-types
  createTest({
    prams: [
      {name: 'a', type: 'uint'},
      {name: 'b', type: 'uint32[]'},
      {name: 'c', type: 'bytes10'},
      {name: 'd', type: 'string'},
    ],
    data:
      '0000000000000000000000000000000000000000000000000000000000000123' +
      '0000000000000000000000000000000000000000000000000000000000000080' +
      '3132333435363738393000000000000000000000000000000000000000000000' +
      '00000000000000000000000000000000000000000000000000000000000000e0' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0000000000000000000000000000000000000000000000000000000000000456' +
      '0000000000000000000000000000000000000000000000000000000000000789' +
      '000000000000000000000000000000000000000000000000000000000000000d' +
      '48656c6c6f2c20776f726c642100000000000000000000000000000000000000',
    expected: {
      a: new BN('123', 16),
      b: [new BN('456', 16), new BN('789', 16)],
      c: '0x31323334353637383930',
      d: 'Hello, world!',
      0: new BN('123', 16),
      1: [new BN('456', 16), new BN('789', 16)],
      2: '0x31323334353637383930',
      3: 'Hello, world!',
      length: 4,
    },
  });
});
