import { toWei, toEth, Units } from './units';

test('toWei', () => {
  expect(toWei(1, Units.Wei).toString()).toBe('1');
  expect(toWei(1, Units.Gwei).toString()).toBe('1000000000');
  expect(toWei(1.25, Units.Gwei).toString()).toBe('1250000000');
  expect(toWei(1, Units.Eth).toString()).toBe('1000000000000000000');
  expect(toWei(0.0001, Units.Eth).toString()).toBe('100000000000000');
  expect(toWei('0.0001', Units.Eth).toString()).toBe('100000000000000');
});

test('toEth', () => {
  expect(toEth('128', Units.Gwei, 9)).toBe('0.000000128');
});
