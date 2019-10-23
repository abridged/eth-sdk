import {
  verifyPrivateKey,
  privateToPublicKey,
  publicKeyToAddress,
} from './secp256k1';

const PRIVATE_KEY = '0x508a52324c49b86422fe9efde3c6cdcc718fb253b910aa57ea32345f7c22f442';
const PUBLIC_KEY = '0x043871ebe3e3718190a1223b79c4629f299e49748e0dc070f17bca88927db33f40d015ddfd9a3205e2f5cf30cb9ee282bfe53f7d54af31b594d441acb511b91952';
const ADDRESS = '0xc696D9E44E5E92AeF5d66b7dD61E27F73F0e8406';

test('verifyPrivateKey', () => {
  expect(verifyPrivateKey(PRIVATE_KEY)).toBeTruthy();
});

test('privateToPublicKey', () => {
  expect(privateToPublicKey(PRIVATE_KEY)).toBe(PUBLIC_KEY);
});

test('publicKeyToAddress', () => {
  expect(publicKeyToAddress(PUBLIC_KEY)).toBe(ADDRESS);
});
