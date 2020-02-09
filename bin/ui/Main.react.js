'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Game = require('./Game.react');
var Lobby = require('./Lobby.react');
var LevelEditor = require('./LevelEditor.react');
var Button = require('./components/Button.react');

function Main(props) {

  var canvasDiv = document.getElementById('canvasWrapper');
  if (canvasDiv != null) {
    var rect = canvasDiv.getBoundingClientRect();
    if (rect.height < rect.width) {
      config.canvasHeight = rect.height;
      config.canvasWidth = rect.height;
    } else {
      config.canvasHeight = rect.width;
      config.canvasWidth = rect.width;
    }
  }
  var content = React.useMemo(function () {
    if (props.state.mode === 'MENU') {
      return React.createElement(Lobby, { dispatch: props.dispatch });
    } else if (props.state.mode === 'GAME') {
      return React.createElement(Game, {
        state: props.state,
        width: config.canvasWidth, height: config.canvasHeight,
        dispatch: props.dispatch
      });
    } else if (props.state.mode === 'EDITOR') {
      return React.createElement(LevelEditor, {
        state: props.state,
        width: config.canvasWidth, height: config.canvasHeight,
        dispatch: props.dispatch
      });
    }
  }, [props.state, config.canvasHeight, config.canvasWidth, props.dispatch]);

  return React.createElement(
    React.Fragment,
    null,
    content,
    getModal(props)
  );
}

function getModal(props) {
  if (!props.modal) {
    return null;
  }
  var _props$state$modal = props.state.modal,
      title = _props$state$modal.title,
      text = _props$state$modal.text,
      buttons = _props$state$modal.buttons;

  var rect = document.getElementById('container').getBoundingClientRect();
  var buttonHTML = buttons.map(function (button) {
    return React.createElement(Button, { label: button.label, onClick: button.onClick });
  });
  return React.createElement(
    'div',
    { className: 'modal',
      style: {
        width: 300,
        top: (rect.height - 200) / 2,
        left: (rect.width - 300) / 2
      } },
    React.createElement(
      'h3',
      null,
      React.createElement(
        'b',
        null,
        title
      )
    ),
    text,
    React.createElement(
      'div',
      { className: 'modalButtons' },
      buttonHTML
    )
  );
}

module.exports = Main;