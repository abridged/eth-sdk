import {Contract} from './Contract';

interface IFunctions {
  test1(a: number, b: number[], c: string, d: string): Contract.IMethodExecute;
}

interface IEvents {
  A: {
    a: 1;
  };
}

test('contractFactory', () => {
  const contract = new Contract<IFunctions, IEvents>([
    {
      type: 'function',
      name: 'test1',
      inputs: [
        {type: 'uint', name: 'a'},
        {type: 'uint32[]', name: 'b'},
        {type: 'bytes10', name: 'c'},
        {type: 'bytes', name: 'd'},
      ],
      stateMutability: 'nonpayable',
      constant: false,
      anonymous: false,
      outputs: [],
      payable: false,
    },
  ]);

  const data = contract.methods.test1(1, [1, 2], '0x01', '0x01').data;
  const signature = contract.methods.test1.signature;

  expect(data).toBe(
    '0xc9a3e0d8' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      '0000000000000000000000000000000000000000000000000000000000000080' +
      '0100000000000000000000000000000000000000000000000000000000000000' +
      '00000000000000000000000000000000000000000000000000000000000000e0' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      '0100000000000000000000000000000000000000000000000000000000000000',
  );

  expect(signature).toBe('0xc9a3e0d8');
});
