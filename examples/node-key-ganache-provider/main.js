const ganache = require('ganache-core');
const {Query, Key, randomHex, randomAddress, toWei} = require('eth-sdk');

const MNEMONIC =
  'silent add cereal habit burger upset burden protect promote fly thumb cloud';

async function main() {
  const provider = ganache.provider({
    mnemonic: MNEMONIC,
  });

  const query = new Query(provider);

  const accounts = await query.eth.accounts;
  const message = randomHex(128);

  console.log('query.eth.accounts[0]:', accounts[0]);
  console.log('query.eth.sign[0]:', await query.eth.sign(accounts[0], message));
  console.log('query.eth.sign[1]:', await query.eth.sign(accounts[1], message));

  console.log();

  const key = Key.createLocalKeyFromMnemonic(MNEMONIC, query);

  query.currentProvider.addExtension(key);

  console.log('query.eth.accounts[0]:', (await query.eth.accounts)[0]);
  console.log('query.eth.sign[0]:', await query.eth.sign(key.address, message));
  console.log('query.eth.sign[1]:', await query.eth.sign(accounts[1], message));

  console.log();

  const to = randomAddress();
  const value = toWei(1);

  const hash = await query.eth.sendTransaction({
    to,
    value,
    from: key.address,
  });

  console.log(
    'transaction:',
    JSON.stringify(await query.eth.getTransaction(hash), null, 2),
  );
  console.log(
    'transactionReceipt:',
    JSON.stringify(await query.eth.getTransactionReceipt(hash), null, 2),
  );
}

main().catch(console.log);
