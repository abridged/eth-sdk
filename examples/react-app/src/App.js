import {Query} from 'eth-sdk';
import React from 'react';
import './App.css';

class App extends React.Component {
  state = {
    newPendingTransactions: [],
    newHeads: [],
  };

  componentDidMount() {
    const query = new Query('wss://ropsten.infura.io/ws');

    query.subscription
      .create('newHeads')
      .then(subscription => {
        subscription.subscribe(newHead => {
          const {newHeads} = this.state;
          this.setState({
            newHeads: [newHead, ...newHeads].slice(0, 5),
          });
        });
      })
      .catch(console.error);

    query.subscription
      .create('newPendingTransactions')
      .then(subscription => {
        subscription.subscribe(newPendingTransaction => {
          const {newPendingTransactions} = this.state;
          this.setState({
            newPendingTransactions: [
              newPendingTransaction,
              ...newPendingTransactions,
            ].slice(0, 20),
          });
        });
      })
      .catch(console.error);
  }

  render() {
    const {newHeads, newPendingTransactions} = this.state;
    return (
      <div className="App">
        <div>
          <h3>Blocks:</h3>
          {newHeads.map(block => (
            <pre key={block.hash}>{JSON.stringify(block, null, 2)}</pre>
          ))}
        </div>
        <div>
          <h3>Pending Transactions:</h3>
          {newPendingTransactions.map(hash => (
            <pre key={hash}>{hash}</pre>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
