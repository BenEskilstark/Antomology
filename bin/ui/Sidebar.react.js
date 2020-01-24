'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var RadioPicker = require('./components/RadioPicker.react');
var Dropdown = require('./components/Dropdown.react');
var StatusCard = require('./StatusCard.react');

var _require2 = require('../selectors/selectors'),
    getSelectedAntIDs = _require2.getSelectedAntIDs;

var useState = React.useState,
    useMemo = React.useMemo,
    useEffect = React.useEffect;


function Sidebar(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;

  var selectedEntities = game.selectedEntities.map(function (id) {
    return game.entities[id];
  });
  var antCards = selectedEntities.map(function (entity) {
    return React.createElement(StatusCard, {
      state: state, entity: entity, dispatch: dispatch,
      key: 'statusCard_' + entity.id });
  });
  return React.createElement(
    'div',
    {
      style: {
        border: '1px solid black',
        display: 'inline-block',
        width: 500,
        position: 'absolute',
        left: config.canvasWidth,
        height: config.canvasHeight,
        overflowY: 'scroll'
      }
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Controls'
      )
    ),
    React.createElement(
      'div',
      null,
      'Left-click and drag will:',
      React.createElement(Dropdown, {
        noNoneOption: true,
        options: ['SELECT', 'PAN', 'MARK_TRAIL', 'CREATE_LOCATION'],
        selected: game.userMode,
        onChange: function onChange(userMode) {
          return dispatch({ type: 'SET_USER_MODE', userMode: userMode });
        }
      }),
      game.userMode === 'CREATE_LOCATION' ? React.createElement('input', { type: 'text', value: game.nextLocationName,
        onChange: function onChange(ev) {
          dispatch({ type: 'UPDATE_NEXT_LOCATION_NAME', name: ev.target.value });
        } }) : null
    ),
    React.createElement(
      'div',
      null,
      'Right-click will cause selected ants to:',
      React.createElement(Dropdown, {
        noNoneOption: true,
        options: ['PICKUP', 'EAT', 'FEED'],
        selected: game.antMode,
        onChange: function onChange(antMode) {
          return dispatch({ type: 'SET_ANT_MODE', antMode: antMode });
        }
      })
    ),
    React.createElement(
      'div',
      {
        style: {
          border: '1px solid black'
        }
      },
      React.createElement(
        'div',
        null,
        React.createElement(
          'b',
          null,
          'Selected Ants'
        )
      ),
      'Assign to All Selected Ants:',
      React.createElement(Dropdown, {
        options: game.tasks.map(function (t) {
          return t.name;
        }),
        selected: 'NONE',
        onChange: function onChange(nextName) {
          if (selectedEntities.length == 0) return;
          var nextTask = game.tasks.filter(function (t) {
            return t.name === nextName;
          })[0];
          dispatch({ type: 'ASSIGN_TASK', task: nextTask, ants: getSelectedAntIDs(game) });
        }
      }),
      antCards
    )
  );
}

module.exports = Sidebar;