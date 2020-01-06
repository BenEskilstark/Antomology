// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const RadioPicker = require('./components/RadioPicker.react');

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
};

function Sidebar(props: Props): React.Node {
  const {state, dispatch} = props;
  return (
    <div
      className="sidebar"
      style={{
        height: config.canvasHeight,
      }}
    >
      Left-click and drag will:
      <RadioPicker
        options={['SELECT', 'MARK', 'CREATE_LOCATION']}
        selected={state.game.userMode}
        onChange={(userMode) => dispatch({type: 'SET_USER_MODE', userMode})}
      />
      Right-click will cause selected ants to:
      <RadioPicker
        options={['PICKUP', 'EAT', 'FEED']}
        selected={state.game.antMode}
        onChange={(antMode) => dispatch({type: 'SET_ANT_MODE', antMode})}
      />
    </div>
  );
}

module.exports = Sidebar;
