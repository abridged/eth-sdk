const { Query, Key, queryProviders, randomAddress, toWei } = require('eth-sdk');
const fetch = require('node-fetch');

const {
  HTTP_PROVIDER_ENDPOINT,
  PRIVATE_KEY,
} = process.env;

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
    from: key.address,
    to,
    value,
  });

  console.log('hash:', hash);
}

main()
  .catch(console.log);
