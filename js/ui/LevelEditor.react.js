// @flow

const React = require('react');
const Canvas = require('./Canvas.react');
const {config} = require('../config');

import type {Action, State} from '../types';

type Props = {
  width: number,
  height: number,
  dispatch: (action: Action) => void,
  state: State,
};

function LevelEditor(props: Props): React.Node {
  return (
    <div className="background" id="background">
      <Canvas
        width={props.width} height={props.height}
      />
      <Sidebar state={props.state} dispatch={props.dispatch} />
    </div>
  );
}

function Sidebar(props: {state: State, dispatch: Action => void}): React.Node {
  return (
    <div
      style={{
        border: '1px solid black',
        display: 'inline-block',
        width: 500,
        position: 'absolute',
        left: config.canvasWidth,
        height: config.canvasHeight,
        overflowY: 'scroll',
      }}
    >

    </div>
  );
}

module.exports = LevelEditor;
