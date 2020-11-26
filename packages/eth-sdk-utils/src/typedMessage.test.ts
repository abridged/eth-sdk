import {randomHex} from './hex';
import {
  randomPrivateKey,
  privateToPublicKey,
  publicKeyToAddress,
} from './secp256k1';
import {recoverAddressFromTypedMessage, signTypedMessage} from './typedMessage';

test('recoverAddressFromTypedMessage', () => {
  const privateKey = randomPrivateKey();
  const publicKey = privateToPublicKey(privateKey);
  const address = publicKeyToAddress(publicKey);
  const message = randomHex(128);

  const typedData = JSON.stringify({
    types: {
      Mail: [
        {
          name: 'message',
          type: 'bytes32',
        },
      ],
    },
    primaryType: 'Mail',
    message: {
      message,
    },
  });

  const signature = signTypedMessage(typedData, privateKey);

  expect(recoverAddressFromTypedMessage(typedData, signature)).toBe(address);
});
