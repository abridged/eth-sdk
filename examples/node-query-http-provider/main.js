// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: node-query-http-provider
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
