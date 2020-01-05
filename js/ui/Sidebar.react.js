// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
};

function Sidebar(props: Props): React.Node {
  const {state, dispatch} = props;
  const markOn = state.game.userMode === 'MARK';
  const locationOn = state.game.userMode === 'CREATE_LOCATION';
  return (
    <div
      className="sidebar"
      style={{
        height: config.canvasHeight,
      }}
    >
      <Button
        label={markOn ? 'Turn Blueprinting Off' : 'Turn Blueprinting On'}
        onClick={() => {
          const userMode = markOn ? null : 'MARK';
          dispatch({type: 'SET_USER_MODE', userMode});
        }}
      />
      <Button
        label={locationOn ? 'Turn Create Location Off' : 'Turn Create Location On'}
        onClick={() => {
          const userMode = locationOn ? null : 'CREATE_LOCATION';
          dispatch({type: 'SET_USER_MODE', userMode});
        }}
      />
    </div>
  );
}

module.exports = Sidebar;
