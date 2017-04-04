import React, { Component } from 'react';
import { encode } from 'querystring';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  componentDidMount() {
    const query = encode({
      lat: '35.4',
      lon: '-97.6',
    })
    fetch(`/api/forecast?${query}`);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
