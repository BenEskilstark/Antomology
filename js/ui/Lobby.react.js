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
    <div>
      <span>
        <Button
          label="Start Test Level"
          onClick={() => {
            dispatch({type: 'START', level: 0});
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
        <Button
          label="Start Level 1"
          hotkey={13} // enter
          onClick={() => {
            dispatch({type: 'START', level: 1});
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
        <Button
          label="Start Level 2"
          onClick={() => {
            dispatch({type: 'START', level: 2});
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
      </span>
      <Button
        label="Level Editor"
          onClick={() => {
            dispatch({type: 'START_EDITOR'});
            dispatch({type: 'START_TICK', updateSim: false});
          }}
      />
    </div>
  );
}

module.exports = Lobby;
