import { toNumberString } from './number';

test('toNumberString', () => {
  expect(toNumberString(1, {
    shift: 1,
    precision: 0,
  })).toBe('10');

  expect(toNumberString(0.1, {
    shift: 1,
    precision: 0,
  })).toBe('1');

  expect(toNumberString(10, {
    shift: -1,
    precision: 0,
  })).toBe('1');

  expect(toNumberString(1, {
    shift: 1,
    precision: 2,
  })).toBe('10.00');

  expect(toNumberString(0.1, {
    shift: 1,
    precision: 2,
  })).toBe('1.00');

  expect(toNumberString(10, {
    shift: -1,
    precision: 2,
  })).toBe('1.00');
});
