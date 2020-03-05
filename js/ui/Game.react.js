// @flow

const React = require('react');
const Canvas = require('./Canvas.react');
const InfoSidebar = require('./InfoSidebar.react');
const SelectionSidebar = require('./SelectionSidebar.react');

import type {Action, State} from '../types';

type Props = {
  width: number,
  height: number,
  dispatch: (action: Action) => Action,
  state: State,
};

function Game(props: Props): React.Node {

  return (
    <div
      className="background" id="background"
      style={{
        position: 'relative',
      }}
    >
      <Canvas
        width={props.width} height={props.height}
      />
      <InfoSidebar state={props.state} dispatch={props.dispatch} />
      <SelectionSidebar state={props.state} dispatch={props.dispatch} />
    </div>
  );
}

module.exports = Game;
