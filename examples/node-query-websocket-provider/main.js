const { Query, queryProviders } = require('eth-sdk');
const WebSocket = require('ws');

async function main() {
  const provider = new queryProviders
    .WebSocketProvider('wss://ropsten.infura.io/ws', {
      webSocketConstructor: WebSocket,
    });

  provider.state$.subscribe((state) => {
    console.log('provider.state:', state);
  });

  const query = new Query(provider);

  console.log('net.version:', await query.net.version);

  const newHeads$ = await query.subscription.create(
    'newHeads',
  );

  const logs$ = await query.subscription.create(
    'logs',
    {
      address: '0x680BD7850c4F3277D765707B9a53Dc2Da98276f3',
    }
  );

  const newPendingTransactions$ = await query.subscription.create(
    'newPendingTransactions',
  );

  newHeads$
    .subscribe((result) => {
      console.log('newHeads$', result);
    });

  logs$
    .subscribe((result) => {
      console.log('logs$:', result);
    });

  // newPendingTransactions$
  //   .subscribe((result) => {
  //     console.log('newPendingTransactions$:', result);
  //   });

  // unsubscribe:
  // await subscription$.unsubscribe();
}

main()
  .catch(console.log);

