// @flow

const {createStore} = require('redux');
const Main = require('./ui/Main.react');
const React = require('react');
const ReactDOM = require('react-dom');
const {rootReducer} = require('./reducers/rootReducer');
const {initSystems} = require('./systems/initSystems');

import type {Store} from './types';

const store = createStore(rootReducer);
window.store = store; // useful for debugging

// initializes the other systems on game start
initSystems(store);

// subscribe the game rendering to the store
renderGame(store);
store.subscribe(() => {
  renderGame(store);
});

function renderGame(store: Store): React.Node {
  ReactDOM.render(
    <Main state={store.getState()} dispatch={store.dispatch} />,
    document.getElementById('container'),
  );
}
