'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Dropdown = require('./components/Dropdown.react');
var Button = require('./components/Button.react');

function StatusCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  var card = null;
  switch (entity.type) {
    case 'ANT':
      card = React.createElement(AntCard, props);
      break;
    case 'EGG':
      card = React.createElement(EggCard, props);
      break;
    case 'LARVA':
      card = React.createElement(LarvaCard, props);
      break;
    case 'PUPA':
      card = React.createElement(PupaCard, props);
      break;
  }

  return card;
}

function AntCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  var ant = entity;

  var hungryStr = ant.calories < config.antStartingCalories * config.antStarvationWarningThreshold ? ' - Hungry' : '';
  var deadStr = ant.alive ? '' : 'Dead ';

  return React.createElement(
    'div',
    {
      className: 'antCard',
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
        deadStr,
        ant.subType,
        ' ',
        ant.type
      )
    ),
    React.createElement(
      'div',
      null,
      'Calories: ',
      ant.calories,
      hungryStr
    ),
    React.createElement(
      'div',
      null,
      'HP: 10/10'
    ),
    React.createElement(
      'div',
      null,
      'Current Task:',
      React.createElement(Dropdown, {
        options: state.game.tasks.map(function (task) {
          return task.name;
        }),
        selected: ant.task != null ? ant.task.name : null,
        onChange: function onChange(nextTaskName) {
          var nextTask = state.game.tasks.filter(function (t) {
            return t.name === nextTaskName;
          })[0];
          dispatch({ type: 'ASSIGN_TASK', task: nextTask, ants: [ant.id] });
        }
      }),
      React.createElement(DeselectButton, props)
    )
  );
};

function DeselectButton(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  return React.createElement(Button, {
    label: 'Deselect',
    onClick: function onClick() {
      dispatch({
        type: 'SET_SELECTED_ENTITIES',
        entityIDs: state.game.selectedEntities.filter(function (id) {
          return id != entity.id;
        })
      });
    }
  });
}

function EggCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  var egg = entity;

  return React.createElement(
    'div',
    {
      className: 'antCard',
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
        egg.type
      )
    ),
    React.createElement(
      'div',
      null,
      'Time to hatch: ',
      config.eggHatchAge - egg.age
    ),
    React.createElement(
      'div',
      null,
      'HP: 10/10'
    ),
    React.createElement(
      'div',
      null,
      'Will become: LARVA then ',
      egg.subType,
      ' ANT'
    ),
    React.createElement(DeselectButton, props)
  );
}

function LarvaCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  var larva = entity;

  var hungryStr = larva.calories < config.larvaStartingCalories * config.antStarvationWarningThreshold ? ' - Hungry' : '';
  var deadStr = ant.alive ? '' : 'Dead ';

  return React.createElement(
    'div',
    {
      className: 'antCard',
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
        deadStr,
        larva.type
      )
    ),
    React.createElement(
      'div',
      null,
      'Calories: ',
      larva.calories,
      hungryStr
    ),
    React.createElement(
      'div',
      null,
      'Calories needed to hatch: ',
      config.larvaEndCalories - larva.calories
    ),
    React.createElement(
      'div',
      null,
      'HP: 10/10'
    ),
    React.createElement(
      'div',
      null,
      'Will become: PUPA then ',
      larva.subType,
      ' ANT'
    ),
    React.createElement(DeselectButton, props)
  );
}

function PupaCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  var pupa = entity;

  return React.createElement(
    'div',
    {
      className: 'antCard',
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
        pupa.type
      )
    ),
    React.createElement(
      'div',
      null,
      'Time to hatch: ',
      config.pupaHatchAge - pupa.age
    ),
    React.createElement(
      'div',
      null,
      'HP: 10/10'
    ),
    React.createElement(
      'div',
      null,
      'Will become: ',
      pupa.subType,
      ' ANT'
    ),
    React.createElement(DeselectButton, props)
  );
}

module.exports = StatusCard;