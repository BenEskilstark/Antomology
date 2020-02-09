// @flow

const React = require('react');
const Canvas = require('./Canvas.react');
const GameSidebar = require('./GameSidebar.react');

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
      <GameSidebar state={props.state} dispatch={props.dispatch} />
    </div>
  );
}

module.exports = Game;
