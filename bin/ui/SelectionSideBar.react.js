'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var Dropdown = require('./components/Dropdown.react');
var StatusCard = require('./StatusCard.react');

var PADDING = 4;

function SelectionSidebar(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;

  var selectionCards = game.selectedEntities.map(function (id) {
    return game.entities[id];
  }).filter(function (e) {
    return e.type != 'LOCATION';
  }).map(function (entity) {
    return React.createElement(StatusCard, {
      state: state, entity: entity, dispatch: dispatch,
      key: 'statusCard_' + entity.id
    });
  });
  var selectedAntsLabel = selectionCards.length > 0 ? React.createElement(
    'div',
    { style: { backgroundColor: 'white', padding: '3px', marginTop: 4 } },
    React.createElement(
      'b',
      null,
      'Selected Ants:'
    )
  ) : null;

  return React.createElement(
    'div',
    {
      style: {
        width: 400,
        position: 'absolute',
        left: config.canvasWidth - (400 + PADDING),
        top: PADDING,
        overflowY: 'scroll'
      }
    },
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: 'white',
          width: '100%',
          padding: '3px'
        }
      },
      'Right-click commands ants to:',
      React.createElement(Dropdown, {
        noNoneOption: true,
        options: ['PICKUP', 'EAT', 'FEED'],
        selected: game.antMode,
        displayOptions: ['Pick up [R]', 'Eat [E]', 'Feed [F]'],
        onChange: function onChange(antMode) {
          return dispatch({ type: 'SET_ANT_MODE', antMode: antMode });
        }
      })
    ),
    selectedAntsLabel,
    selectionCards
  );
}

module.exports = SelectionSidebar;