'use strict';

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Dropdown = require('./components/Dropdown.react');
var Button = require('./components/Button.react');

function AntCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      ant = props.ant;


  var hungryStr = ant.calories < config.antStartingCalories * config.antStarvationWarningThreshold ? ' - Hungry' : '';

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
        ant.subType
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
      React.createElement(Button, {
        label: 'Deselect',
        onClick: function onClick() {
          dispatch({
            type: 'SET_SELECTED_ENTITIES',
            entityIDs: state.game.selectedEntities.filter(function (id) {
              return id != ant.id;
            })
          });
        }
      })
    )
  );
};

module.exports = AntCard;