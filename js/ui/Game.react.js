// @flow

const React = require('react');
const Canvas = require('./Canvas.react');
const Sidebar = require('./Sidebar.react');

import type {Action, State} from '../types';

type Props = {
  width: number,
  height: number,
  dispatch: (action: Action) => Action,
  state: State,
};

function Game(props: Props): React.Node {

  return (
    <div className="background" id="background">
      <Canvas
        width={props.width} height={props.height}
      />
      <Sidebar state={props.state} dispatch={props.dispatch} />
    </div>
  );
}

module.exports = Game;
