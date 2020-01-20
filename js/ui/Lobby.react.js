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
    <span>
      <Button
        label="Start Test Level"
        hotkey={13} // enter
        onClick={() => {
          dispatch({type: 'START', level: 0});
          dispatch({type: 'START_TICK'});
        }}
      />
      <Button
        label="Start Level 1"
        onClick={() => {
          dispatch({type: 'START', level: 1});
          dispatch({type: 'START_TICK'});
        }}
      />
    </span>
  );
}

module.exports = Lobby;
