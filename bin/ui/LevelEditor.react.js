'use strict';

var React = require('react');
var Canvas = require('./Canvas.react');

var _require = require('../config'),
    config = _require.config;

function LevelEditor(props) {
  return React.createElement(
    'div',
    { className: 'background', id: 'background' },
    React.createElement(Canvas, {
      width: props.width, height: props.height
    }),
    React.createElement(Sidebar, { state: props.state, dispatch: props.dispatch })
  );
}

function Sidebar(props) {
  return React.createElement('div', {
    style: {
      border: '1px solid black',
      display: 'inline-block',
      width: 500,
      position: 'absolute',
      left: config.canvasWidth,
      height: config.canvasHeight,
      overflowY: 'scroll'
    }
  });
}

module.exports = LevelEditor;