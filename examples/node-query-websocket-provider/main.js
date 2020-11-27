// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: node-query-websocket-provider
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {Query, queryProviders, sleep} = require('eth-sdk');
const webSocketConstructor = require('ws');

async function main() {
  const provider = new queryProviders.WebSocketProvider(
    'wss://ropsten.infura.io/ws',
    {
      webSocketConstructor,
    },
  );

  provider.state$.subscribe(state => {
    console.log('provider.state:', state);
  });

  const query = new Query(provider);

  console.log('query.net.version:', await query.net.version);

  const newHeads$ = await query.subscription.create('newHeads');

  const logs$ = await query.subscription.create('logs', {
    address: '0x680BD7850c4F3277D765707B9a53Dc2Da98276f3',
  });

  const newPendingTransactions$ = await query.subscription.create(
    'newPendingTransactions',
  );

  newHeads$.subscribe(result => {
    console.log('query.subscription.newHeads$', result);
  });

  logs$.subscribe(result => {
    console.log('query.subscription.logs$:', result);
  });

  newPendingTransactions$.subscribe(result => {
    console.log('query.subscription.newPendingTransactions$:', result);
  });

  await sleep(30000); // sleep for 30 sec.

  // unsubscribe:
  await newHeads$.unsubscribe();

  // unsubscribe all:
  await query.subscription.unsubscribeAll();

  await provider.disconnect();
}

main().catch(console.log);
