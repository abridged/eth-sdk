import { randomHex } from './hex';
import { randomPrivateKey, privateToPublicKey, publicKeyToAddress } from './secp256k1';
import { signPersonalMessage, recoverAddressFromPersonalMessage } from './personalMessage';

test('recoverAddressFromPersonalMessage', () => {
  const privateKey = randomPrivateKey();
  const publicKey =  privateToPublicKey(privateKey);
  const address = publicKeyToAddress(publicKey);
  const message = randomHex(128);
  const signature = signPersonalMessage(message, privateKey);

  expect(recoverAddressFromPersonalMessage(message, signature)).toBe(address);
});
