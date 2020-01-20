'use strict';

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var React = require('react');

var _require = require('../selectors/selectors');

_objectDestructuringEmpty(_require);

var Button = require('./components/Button.react');

function Lobby(props) {
  var dispatch = props.dispatch;

  return React.createElement(
    'span',
    null,
    React.createElement(Button, {
      label: 'Start Test Level',
      hotkey: 13 // enter
      , onClick: function onClick() {
        dispatch({ type: 'START', level: 0 });
        dispatch({ type: 'START_TICK' });
      }
    }),
    React.createElement(Button, {
      label: 'Start Level 1',
      onClick: function onClick() {
        dispatch({ type: 'START', level: 1 });
        dispatch({ type: 'START_TICK' });
      }
    })
  );
}

module.exports = Lobby;