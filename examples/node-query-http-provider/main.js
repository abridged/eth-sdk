const { Query, queryProviders } = require('eth-sdk');
const fetch = require('node-fetch');

async function main() {
  const provider = new queryProviders
    .HttpProvider('https://mainnet.infura.io/', {
      fetch,
    });

  const query = new Query(provider);

  console.log('net.version:', await query.net.version);
}

main()
  .catch(console.log);

