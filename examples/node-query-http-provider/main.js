const {Query, queryProviders} = require('eth-sdk');
const fetch = require('node-fetch');

async function main() {
  const provider = new queryProviders.HttpProvider('https://kovan.infura.io/', {
    fetch,
  });

  const query = new Query(provider);

  console.log('query.net.version:', await query.net.version);
  console.log('query.eth.chainId:', await query.eth.chainId);
}

main().catch(console.log);
