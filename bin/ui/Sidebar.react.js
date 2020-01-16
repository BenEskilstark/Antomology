'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var RadioPicker = require('./components/RadioPicker.react');
var Dropdown = require('./components/Dropdown.react');
var StatusCard = require('./StatusCard.react');
var TaskCard = require('./TaskCard.react');

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
        options: ['SELECT', 'MARK_TRAIL', 'CREATE_LOCATION'],
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
      antCards,
      React.createElement(TaskEditor, props)
    )
  );
}

function TaskEditor(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;

  var _useState = useState('New Task'),
      _useState2 = _slicedToArray(_useState, 2),
      taskName = _useState2[0],
      setTaskName = _useState2[1];

  var editingTask = useMemo(function () {
    return taskName === 'New Task' ? { name: 'New Task', repeating: false, behaviorQueue: [] } : game.tasks.filter(function (t) {
      return t.name === taskName;
    })[0];
  }, [taskName]);
  return React.createElement(
    'div',
    {
      className: 'taskEditor',
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
        'Task Editor'
      )
    ),
    'Edit Task: ',
    React.createElement(Dropdown, {
      noNoneOption: true,
      options: ['New Task'].concat(game.tasks.map(function (t) {
        return t.name;
      })),
      selected: taskName,
      onChange: setTaskName
    }),
    React.createElement(TaskCard, {
      state: state,
      dispatch: dispatch,
      setTaskName: setTaskName,
      newTask: taskName === 'New Task',
      task: editingTask
    })
  );
}

module.exports = Sidebar;