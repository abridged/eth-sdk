import BN from 'bn.js';
import { Query, queryProviders, ContractFactory, IContract, toHex, TQuantity, randomAddress } from 'eth-sdk';
import fetch from 'node-fetch';

const abiItems = require('./abi.json');

interface IContractMethods {
  balanceOf(address: string): IContract.IMethodExecute<{
    balance: BN
  }>;

  transfer(to: string, value: TQuantity): IContract.IMethodExecute;
}

interface IContractEvents {
  Transfer: {
    from: string;
    to: string;
    value: BN;
  }
}

async function main(): Promise<void> {
  const provider = new queryProviders
    .HttpProvider('https://mainnet.infura.io/', {
      fetch,
    });

  const query = new Query(provider);
  const contractFactory = new ContractFactory<IContractMethods, IContractEvents>(abiItems, query);

  // see: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7
  const holder = '0x6158333905611b9baee7d243567948cf05360aae'; // some random token holder
  const contract = contractFactory.getInstance('0xdac17f958d2ee523a2206206994597c13d831ec7');

  console.log('contract.address:', contract.address);

  const balanceOf = contract.methods.balanceOf(holder);
  const output = await balanceOf.call();

  console.log('methods.balanceOf.data:', balanceOf.data);
  console.log('methods.balanceOf.output.balance:', toHex(output.balance));

  const transfer = contract.methods.transfer(randomAddress(), 100);

  const gas = await transfer.estimate({
    from: holder,
  });

  console.log('methods.transfer.data:', transfer.data);
  console.log('methods.transfer.estimate:', gas);

  const eventLogs = await contract.events.Transfer.getLogs({
    fromBlock: 8798207,
    toBlock: 8798207,
  });

  console.log('events.Transfer.getLogs[0]:', JSON.stringify(eventLogs[0], null, 2));
}

main()
  .catch(console.log);
