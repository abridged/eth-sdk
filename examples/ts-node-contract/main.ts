// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: ts-node-contract
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import BN from 'bn.js';
import {
  Query,
  queryProviders,
  Contract,
  toHex,
  TQuantity,
  randomAddress,
} from 'eth-sdk';
import fetch from 'node-fetch';

const abiItems = require('./abi.json');

interface IContractMethods {
  balanceOf(
    address: string,
  ): Contract.IMethodExecute<{
    balance: BN;
  }>;

  transfer(to: string, value: TQuantity): Contract.IMethodExecute;
}

interface IContractEvents {
  Transfer: {
    from: string;
    to: string;
    value: BN;
  };
}

async function main(): Promise<void> {
  const provider = new queryProviders.HttpProvider(
    'https://mainnet.infura.io/',
    {
      fetch,
    },
  );

  const query = new Query(provider);
  // see: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7
  const contract = new Contract<IContractMethods, IContractEvents>(
    abiItems,
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    query,
  );
  const holder = '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8'; // some random token holder

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

  console.log(
    'events.Transfer.getLogs[0]:',
    JSON.stringify(eventLogs[0], null, 2),
  );
}

main().catch(console.log);
