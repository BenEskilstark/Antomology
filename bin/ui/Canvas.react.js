'use strict';

var React = require('react');

function Canvas(props) {
  // canvasWrapper allows for checking dynamic width/height
  return React.createElement(
    'div',
    { id: 'canvasWrapper',
      style: {
        width: '66%', height: '100%',
        display: 'inline-block',
        float: 'left'
      }
    },
    React.createElement('canvas', {
      id: 'canvas', style: {
        backgroundColor: 'white',
        cursor: 'pointer'
      },
      width: props.width, height: props.height
    })
  );
}

module.exports = Canvas;