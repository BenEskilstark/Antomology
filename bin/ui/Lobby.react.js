'use strict';

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var React = require('react');

var _require = require('../selectors/selectors');

_objectDestructuringEmpty(_require);

var Button = require('./components/Button.react');

function Lobby(props) {
  var dispatch = props.dispatch;

  return React.createElement(
    'div',
    null,
    React.createElement(
      'span',
      null,
      React.createElement(Button, {
        label: 'Start Test Level',
        onClick: function onClick() {
          dispatch({ type: 'START', level: 0 });
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      }),
      React.createElement(Button, {
        label: 'Start Level 1',
        onClick: function onClick() {
          dispatch({ type: 'START', level: 1 });
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      }),
      React.createElement(Button, {
        label: 'Start Level 2',
        onClick: function onClick() {
          dispatch({ type: 'START', level: 2 });
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      })
    ),
    React.createElement(Button, {
      label: 'Level Editor',
      onClick: function onClick() {
        dispatch({ type: 'START_EDITOR' });
        dispatch({ type: 'START_TICK', updateSim: false });
      }
    })
  );
}

module.exports = Lobby;