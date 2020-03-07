'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var Dropdown = require('./components/Dropdown.react');
var RadioPicker = require('./components/RadioPicker.react');
var Slider = require('./components/Slider.react');
var StatusCard = require('./StatusCard.react');
var useState = React.useState,
    useMemo = React.useMemo,
    useEffect = React.useEffect;


var PADDING = 4;

var tabStyle = {
  backgroundColor: 'white',
  padding: '3px',
  marginTop: 1
};

var barStyle = {
  backgroundColor: 'white',
  padding: '3px'
};

function InfoSidebar(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;
  var infoTab = game.infoTab;


  var infoBar = null;
  switch (infoTab) {
    case 'Pheromones':
      infoBar = PheromoneTab(props);
      break;
    case 'Locations':
      infoBar = LocationTab(props);
      break;
    case 'Colony Status':
      infoBar = StatusTab(props);
      break;
    case 'Options':
      infoBar = OptionsTab(props);
      break;
  }

  return React.createElement(
    'div',
    {
      style: {
        width: 400,
        position: 'absolute',
        left: PADDING,
        top: PADDING,
        overflowY: 'scroll',
        overflowX: 'hidden'
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
      'Left-click and drag:',
      React.createElement(Dropdown, {
        noNoneOption: true,
        options: ['SELECT', 'CREATE_LOCATION', 'DELETE_LOCATION'],
        displayOptions: ['Select [Z]', 'Create Location [C]', 'Delete Location [X]'],
        selected: game.userMode,
        onChange: function onChange(userMode) {
          return dispatch({ type: 'SET_USER_MODE', userMode: userMode });
        }
      }),
      game.userMode === 'CREATE_LOCATION' ? React.createElement(
        'div',
        null,
        React.createElement('input', { type: 'text', value: game.nextLocationName,
          onChange: function onChange(ev) {
            dispatch({ type: 'UPDATE_NEXT_LOCATION_NAME', name: ev.target.value });
          }
        })
      ) : null
    ),
    React.createElement(
      'div',
      {
        style: tabStyle
      },
      'Info Tab:',
      React.createElement(Dropdown, {
        noNoneOption: true,
        options: ['Colony Status', 'Locations', 'Pheromones', 'Options', 'None'],
        displayOptions: ['Colony Status [U]', 'Locations [L]', 'Pheromones [H]', 'Options [K]', 'None [N]'],
        selected: infoTab,
        onChange: function onChange(nextInfoTab) {
          dispatch({ type: 'SET_INFO_TAB', infoTab: nextInfoTab });
        }
      })
    ),
    infoBar
  );
}

/////////////////////////////////////////////////////////////////////////////
// Pheromones
/////////////////////////////////////////////////////////////////////////////
function PheromoneTab(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;


  return React.createElement(
    'div',
    {
      style: barStyle
    },
    React.createElement(
      'b',
      null,
      'Pheromones'
    ),
    React.createElement(
      'div',
      null,
      'Hold indicated key while commanding selected ants and they will create a pheromone trail of that color wherever they go.'
    ),
    React.createElement(
      'div',
      null,
      'Create a condition for a trail to allow only ants that satisfy the condition to follow it.'
    ),
    React.createElement(
      'div',
      null,
      'Use negative trail strength to delete trails.'
    ),
    pheromoneCategory(game, dispatch, 1),
    pheromoneCategory(game, dispatch, 2),
    pheromoneCategory(game, dispatch, 3)
  );
}

function pheromoneCategory(game, dispatch, category) {
  var strength = game.pheromones[category].strength;
  var condition = game.pheromones[category].condition;
  var label = '';
  switch (category) {
    case 1:
      label = 'Green [P]';
      break;
    case 2:
      label = 'Blue [O]';
      break;
    case 3:
      label = 'Red [I]';
      break;
  }
  return React.createElement(
    'div',
    {
      style: { borderTop: '1px solid black' }
    },
    'Type: ',
    label,
    React.createElement(Slider, {
      min: -1 * config.pheromoneMaxQuantity,
      max: config.pheromoneMaxQuantity,
      step: 20,
      value: strength,
      label: 'Strength: ',
      onChange: function onChange(str) {
        dispatch({ type: 'SET_PHEROMONE_STRENGTH', category: category, strength: str });
      }
    }),
    'Condition:'
  );
}

/////////////////////////////////////////////////////////////////////////////
// Locations
/////////////////////////////////////////////////////////////////////////////
function LocationTab(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;


  var locationCards = game.selectedEntities.map(function (id) {
    return game.entities[id];
  }).filter(function (e) {
    return e.type === 'LOCATION';
  }).map(function (entity) {
    return React.createElement(StatusCard, {
      state: state, entity: entity, dispatch: dispatch,
      key: 'locationStatusCard_' + entity.id
    });
  });

  return React.createElement(
    'span',
    null,
    React.createElement(
      'div',
      {
        style: barStyle
      },
      React.createElement(
        'b',
        null,
        'Selected Locations'
      )
    ),
    locationCards
  );
}

/////////////////////////////////////////////////////////////////////////////
// Status
/////////////////////////////////////////////////////////////////////////////
function StatusTab(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;


  var numAnts = game.ANT.map(function (id) {
    return game.entities[id];
  }).filter(function (a) {
    return a.alive;
  }).length;

  var numEggs = game.EGG.map(function (id) {
    return game.entities[id];
  }).filter(function (a) {
    return a.alive;
  }).length;

  var numLarva = game.LARVA.map(function (id) {
    return game.entities[id];
  }).filter(function (a) {
    return a.alive;
  }).length;

  var numPupa = game.PUPA.map(function (id) {
    return game.entities[id];
  }).filter(function (a) {
    return a.alive;
  }).length;

  return React.createElement(
    'div',
    {
      style: barStyle
    },
    React.createElement(
      'b',
      null,
      'Colony Status'
    ),
    React.createElement(
      'div',
      null,
      'Ants: ',
      numAnts
    ),
    React.createElement(
      'div',
      null,
      'Eggs: ',
      numEggs
    ),
    React.createElement(
      'div',
      null,
      'Larva: ',
      numLarva
    ),
    React.createElement(
      'div',
      null,
      'Pupa: ',
      numPupa
    ),
    React.createElement(Button, {
      label: 'Select Queen [Q]',
      onClick: function onClick() {
        var queenID = game.ANT.map(function (id) {
          return game.entities[id];
        }).filter(function (a) {
          return a.subType === 'QUEEN';
        })[0].id;
        dispatch({ type: 'SET_SELECTED_ENTITIES', entityIDs: [queenID] });
      }
    })
  );
}

/////////////////////////////////////////////////////////////////////////////
// Options
/////////////////////////////////////////////////////////////////////////////
function OptionsTab(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;


  var isPaused = game.tickInterval == null;

  return React.createElement(
    'div',
    {
      style: barStyle
    },
    React.createElement(
      'b',
      null,
      'Options'
    ),
    React.createElement(
      'div',
      null,
      React.createElement(Button, {
        label: isPaused ? "Resume [Space]" : "Pause [Space]",
        onClick: function onClick() {
          if (isPaused) {
            dispatch({ type: 'START_TICK', updateSim: true });
          } else {
            dispatch({ type: 'STOP_TICK' });
          }
        }
      }),
      React.createElement(Button, {
        label: 'Restart Level',
        onClick: function onClick() {
          dispatch({ type: 'STOP_TICK' });
          dispatch({ type: 'START', level: game.level });
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      }),
      React.createElement(Button, {
        label: 'Quit to Menu',
        onClick: function onClick() {
          dispatch({ type: 'STOP_TICK' });
          dispatch({ type: 'RETURN_TO_MENU' });
        }
      })
    )
  );
}

module.exports = InfoSidebar;