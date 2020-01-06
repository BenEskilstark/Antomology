'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var RadioPicker = require('./components/RadioPicker.react');

function Sidebar(props) {
  var state = props.state,
      dispatch = props.dispatch;

  return React.createElement(
    'div',
    {
      className: 'sidebar',
      style: {
        height: config.canvasHeight
      }
    },
    'Left-click and drag will:',
    React.createElement(RadioPicker, {
      options: ['SELECT', 'MARK', 'CREATE_LOCATION'],
      selected: state.game.userMode,
      onChange: function onChange(userMode) {
        return dispatch({ type: 'SET_USER_MODE', userMode: userMode });
      }
    }),
    'Right-click will cause selected ants to:',
    React.createElement(RadioPicker, {
      options: ['PICKUP', 'EAT', 'FEED'],
      selected: state.game.antMode,
      onChange: function onChange(antMode) {
        return dispatch({ type: 'SET_ANT_MODE', antMode: antMode });
      }
    })
  );
}

module.exports = Sidebar;