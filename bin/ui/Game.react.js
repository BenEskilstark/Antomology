'use strict';

var React = require('react');
var Canvas = require('./Canvas.react');
var GameSidebar = require('./GameSidebar.react');

function Game(props) {

  return React.createElement(
    'div',
    { className: 'background', id: 'background' },
    React.createElement(Canvas, {
      width: props.width, height: props.height
    }),
    React.createElement(GameSidebar, { state: props.state, dispatch: props.dispatch })
  );
}

module.exports = Game;