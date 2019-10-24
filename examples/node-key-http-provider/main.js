const { Query, Key, queryProviders, randomAddress, toWei } = require('eth-sdk');
const fetch = require('node-fetch');

// see: https://github.com/etherspot/etherspot-local
const HTTP_PROVIDER_ENDPOINT = 'http://localhost:8545';
const PRIVATE_KEY = '0x9e73ef82d7e4ebeb1d3ae220df7ccd0db239c65092fc0f42084db75af7f10e3a';

async function main() {
  const provider = new queryProviders.HttpProvider(HTTP_PROVIDER_ENDPOINT, {
    fetch,
  });

  const query = new Query(provider);
  const key = new Key(PRIVATE_KEY, query);

  query
    .currentProvider
    .addExtension(key);

  const to = randomAddress();
  const value = toWei(1.5);

  const hash = await query.eth.sendTransaction({
    from: await key.address,
    to,
    value,
  });

  console.log('hash:', hash);
}

main()
  .catch(console.log);

