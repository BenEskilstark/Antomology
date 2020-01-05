// @flow

const React = require('react');
const {
} = require('../selectors/selectors');
const Button = require('./components/Button.react');

import type {State, Action} from '../types';

type Props = {
  dispatch: (action: Action) => Action,
};

function Lobby(props: Props): React.Node {
  const {dispatch} = props;
  return (
    <Button
      label="Start Game"
      hotkey={13} // enter
      onClick={() => {
        dispatch({type: 'START'});
        dispatch({type: 'START_TICK'});
      }}
    />
  );
}

module.exports = Lobby;
