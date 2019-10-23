import BN from 'bn.js';
import { Query, queryProviders, ContractFactory, IContract, toHex, TQuantity, randomAddress } from 'eth-sdk';
import fetch from 'node-fetch';

const abiItems = require('./abi.json');

interface ITokenMethods {
  balanceOf(address: string): IContract.IMethodExecute<{
    balance: BN
  }>;

  transfer(to: string, value: TQuantity): IContract.IMethodExecute;
}

async function main(): Promise<void> {
  const provider = new queryProviders
    .HttpProvider('https://mainnet.infura.io/', {
      fetch,
    });

  const query = new Query(provider);
  const contractFactory = new ContractFactory<ITokenMethods>(abiItems, query);

  // see: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7
  const holder = '0x6158333905611b9baee7d243567948cf05360aae'; // some random token holder
  const contract = contractFactory.getInstance('0xdac17f958d2ee523a2206206994597c13d831ec7');

  console.log('contract.address:', contract.address);

  const balanceOf = contract.methods.balanceOf(holder);
  const output = await balanceOf.call();

  console.log('balanceOf.data:', balanceOf.data);
  console.log('balanceOf.output.balance:', toHex(output.balance));

  const transfer = contract.methods.transfer(randomAddress(), 100);

  const gas = await transfer.estimate({
    from: holder,
  });

  console.log('transfer.data:', transfer.data);
  console.log('transfer.estimate:', gas);

}

main()
  .catch(console.log);
