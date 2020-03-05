'use strict';

var React = require('react');
var Canvas = require('./Canvas.react');
var InfoSidebar = require('./InfoSidebar.react');
var SelectionSidebar = require('./SelectionSidebar.react');

function Game(props) {

  return React.createElement(
    'div',
    {
      className: 'background', id: 'background',
      style: {
        position: 'relative'
      }
    },
    React.createElement(Canvas, {
      width: props.width, height: props.height
    }),
    React.createElement(InfoSidebar, { state: props.state, dispatch: props.dispatch }),
    React.createElement(SelectionSidebar, { state: props.state, dispatch: props.dispatch })
  );
}

module.exports = Game;