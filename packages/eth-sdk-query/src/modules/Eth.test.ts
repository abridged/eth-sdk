import {eth} from '../__mocks__';
import {Eth} from './Eth';

describe('Eth', () => {
  test('gasPrice', async () => {
    const gasPrice = await eth.gasPrice;
    expect(gasPrice.toNumber()).toBe(0x1e18cc3f0310);
  });
});
