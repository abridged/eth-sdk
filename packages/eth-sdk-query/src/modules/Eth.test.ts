import { eth } from '../__mocks__';
import { Eth } from './Eth';

describe('Eth', () => {
  test('gasPrice', async () => {
    await expect(eth.gasPrice).resolves.toBe('10000000000000');
  });
});
