const { Query, queryProviders, ContractFactory } = require('eth-sdk');
const fetch = require('node-fetch');
const abiItems = require('./abi.json');

async function main() {
  const provider = new queryProviders
    .HttpProvider('https://mainnet.infura.io/', {
      fetch,
    });

  const query = new Query(provider);
  const contractFactory = new ContractFactory(abiItems, query);

  // see: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7
  const contract = contractFactory.getInstance('0xdAC17F958D2ee523a2206206994597C13D831ec7');

  const method = contract.methods.balanceOf('0xdAC17F958D2ee523a2206206994597C13D831ec7');

  const { data } = method;

  console.log('data:', data);

  const output = await method.call();

  console.log('output:', JSON.stringify(output));
}

main()
  .catch(console.log);

