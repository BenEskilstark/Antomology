'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');

function Sidebar(props) {
  var state = props.state,
      dispatch = props.dispatch;

  var markOn = state.game.userMode === 'MARK';
  var locationOn = state.game.userMode === 'CREATE_LOCATION';
  return React.createElement(
    'div',
    {
      className: 'sidebar',
      style: {
        height: config.canvasHeight
      }
    },
    React.createElement(Button, {
      label: markOn ? 'Turn Blueprinting Off' : 'Turn Blueprinting On',
      onClick: function onClick() {
        var userMode = markOn ? null : 'MARK';
        dispatch({ type: 'SET_USER_MODE', userMode: userMode });
      }
    }),
    React.createElement(Button, {
      label: locationOn ? 'Turn Create Location Off' : 'Turn Create Location On',
      onClick: function onClick() {
        var userMode = locationOn ? null : 'CREATE_LOCATION';
        dispatch({ type: 'SET_USER_MODE', userMode: userMode });
      }
    })
  );
}

module.exports = Sidebar;