import BN from 'bn.js';
import { Query, queryProviders, ContractFactory, IContract, toHex } from 'eth-sdk';
import fetch from 'node-fetch';

const abiItems = require('./abi.json');

interface ITokenMethods {
  balanceOf(address: string): IContract.IMethodExecute<{
    balance: BN
  }>
}

async function main(): Promise<void> {
  const provider = new queryProviders
    .HttpProvider('https://mainnet.infura.io/', {
      fetch,
    });

  const query = new Query(provider);
  const contractFactory = new ContractFactory<ITokenMethods>(abiItems, query);

  // see: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7
  const contract = contractFactory.getInstance('0xdac17f958d2ee523a2206206994597c13d831ec7');
  const method = contract.methods.balanceOf('0xdac17f958d2ee523a2206206994597c13d831ec7');
  const output = await method.call();

  console.log('contract.address:', contract.address);
  console.log('method.data:', method.data);
  console.log('method.output.balance:', toHex(output.balance));
}

main()
  .catch(console.log);
