'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var Checkbox = require('./components/Checkbox.react');
var Dropdown = require('./components/Dropdown.react');

var _require2 = require('../selectors/selectors'),
    getEntitiesByType = _require2.getEntitiesByType;

var useState = React.useState,
    useEffect = React.useEffect;


function BehaviorCard(props) {
  var state = props.state;

  if (props.behavior == null) {
    return null;
  }
  // mutating the copy of behavior, but then also re-setting it to itself for re-rendering

  var _useState = useState(props.behavior),
      _useState2 = _slicedToArray(_useState, 2),
      behavior = _useState2[0],
      setBehavior = _useState2[1];

  useEffect(function () {
    setBehavior(props.behavior);
  }, [props.behavior]);

  var selectedSubject = '';
  var subjects = [];
  if (behavior.type == 'DO_ACTION') {
    subjects = ['MOVE', 'PICKUP', 'PUTDOWN', 'IDLE', 'EAT', 'FEED', 'LAY'];
    selectedSubject = behavior.action.type;
  } else if (behavior.type == 'IF' || behavior.type == 'WHILE') {
    subjects = ['LOCATION', 'RANDOM', 'HOLDING', 'NEIGHBORING', 'BLOCKED', 'CALORIES', 'AGE'];
    selectedSubject = behavior.condition.type;
  } else if (behavior.type == 'SWITCH_TASK') {
    subjects = state.game.tasks.map(function (t) {
      return t.name;
    });
    selectedSubject = behavior.task;
  } else if (behavior.type == 'DO_HIGH_LEVEL_ACTION') {
    subjects = ['MOVE', 'PICKUP', 'PUTDOWN', 'EAT', 'FEED', 'LAY'];
    selectedSubject = behavior.action.type;
  }
  return React.createElement(
    'div',
    {
      className: 'behaviorCard',
      style: {}
    },
    React.createElement(Dropdown, {
      options: ['DO_ACTION', 'DO_HIGH_LEVEL_ACTION', 'IF', 'WHILE', 'SWITCH_TASK'],
      selected: behavior.type,
      onChange: function onChange(newType) {
        var newBehavior = transitionBehavior(behavior, newType);
        setBehavior(newBehavior);
      }
    }),
    React.createElement(Dropdown, {
      options: subjects,
      selected: selectedSubject,
      onChange: function onChange(nextSubject) {
        if (behavior.type == 'DO_ACTION' || behavior.type == 'DO_HIGH_LEVEL_ACTION') {
          behavior.action.type = nextSubject;
        } else if (behavior.type === 'IF' || behavior.type === 'WHILE') {
          behavior.condition.type = nextSubject;
        } else {
          behavior.task = nextSubject;
        }
        setBehavior(behavior);
      }
    }),
    behavior.type == 'DO_ACTION' || behavior.type == 'DO_HIGH_LEVEL_ACTION' ? React.createElement(DoActionCard, {
      state: state,
      behavior: behavior,
      setBehavior: setBehavior
    }) : null,
    behavior.type === 'IF' || behavior.type === 'WHILE' ? React.createElement(Conditional, {
      state: state,
      condition: behavior.condition,
      behavior: behavior,
      setBehavior: setBehavior
    }) : null,
    behavior.type === 'IF' ? React.createElement(
      'span',
      null,
      'Then: ',
      React.createElement(
        'div',
        { style: { paddingLeft: 10 } },
        React.createElement(BehaviorCard, {
          state: state, behavior: behavior.behavior
        })
      ),
      'Else: ',
      React.createElement(
        'div',
        { style: { paddingLeft: 10 } },
        React.createElement(BehaviorCard, {
          state: state, behavior: behavior.elseBehavior
        })
      )
    ) : null,
    behavior.type === 'WHILE' ? React.createElement(
      'span',
      null,
      'Do: ',
      React.createElement(
        'div',
        { style: { paddingLeft: 10 } },
        React.createElement(BehaviorCard, {
          state: state, behavior: behavior.behavior
        })
      )
    ) : null
  );
}

//////////////////////////////////////////////////////////////////////////////
// Behavior Transition
//////////////////////////////////////////////////////////////////////////////
function transitionBehavior(behavior, newType) {
  var newBehavior = _extends({}, behavior);
  delete newBehavior.action;
  delete newBehavior.condition;
  delete newBehavior.task;
  delete newBehavior.elseBehavior;
  newBehavior.type = newType;
  switch (newType) {
    case 'DO_ACTION':
      {
        newBehavior.action = {
          type: 'IDLE',
          payload: {
            object: null
          }
        };
        break;
      }
    case 'IF':
      {
        newBehavior.condition = {
          type: 'RANDOM',
          comparator: 'EQUALS',
          not: false,
          payload: {
            object: 1
          }
        };
        newBehavior.behavior = {
          type: 'DO_ACTION',
          action: {
            type: 'IDLE',
            payload: {
              object: null
            }
          }
        };
        newBehavior.elseBehavior = {
          type: 'DO_ACTION',
          action: {
            type: 'IDLE',
            payload: {
              object: null
            }
          }
        };
        break;
      }
    case 'WHILE':
      {
        newBehavior.condition = {
          type: 'RANDOM',
          comparator: 'EQUALS',
          not: false,
          payload: {
            object: 1
          }
        };
        newBehavior.behavior = {
          type: 'DO_ACTION',
          action: {
            type: 'IDLE',
            payload: {
              object: null
            }
          }
        };
        break;
      }
    case 'SWITCH_TASK':
      {
        newBehavior.task = 'Idle';
        break;
      }
    case 'DO_HIGH_LEVEL_ACTION':
      {
        newBehavior.action = {
          type: 'MOVE',
          payload: {
            object: 'RANDOM'
          }
        };
      }
  }
  return newBehavior;
}

//////////////////////////////////////////////////////////////////////////////
// Conditional
//////////////////////////////////////////////////////////////////////////////
function Conditional(props) {
  var condition = props.condition,
      state = props.state,
      behavior = props.behavior,
      setBehavior = props.setBehavior;

  var typeName = condition.type;
  var conditionObject = condition.payload.object;
  if (conditionObject != null && conditionObject.name != null) {
    conditionObject = conditionObject.name;
  }
  var comparator = condition.comparator;
  var comparatorOptions = ['EQUALS', 'LESS_THAN', 'GREATER_THAN'];
  if (typeName == 'LOCATION' || typeName === 'HOLDING' || typeName === 'NEIGHBORING' || typeName === 'BLOCKED') {
    comparatorOptions = ['EQUALS'];
  }
  var objectField = 'True';
  if (typeName === 'RANDOM' || typeName === 'CALORIES' || typeName === 'AGE') {
    objectField = React.createElement('input', { type: 'text',
      value: conditionObject,
      onChange: function onChange(ev) {
        var val = ev.target.value;
        if (val == '' || val[val.length - 1] === '.') {
          behavior.condition.payload.object = val;
        } else if (parseFloat(val) == NaN) {
          console.log(val);
          return;
        } else {
          behavior.condition.payload.object = parseFloat(val);
        }
        setBehavior(behavior);
      }
    });
  }
  if (typeName === 'LOCATION') {
    objectField = React.createElement(Dropdown, {
      options: getEntitiesByType(state.game, ['LOCATION']).map(function (l) {
        return l.name;
      }),
      selected: conditionObject,
      onChange: function onChange(locName) {
        behavior.condition.payload.object = locName;
        setBehavior(behavior);
      }
    });
  }
  if (typeName === 'HOLDING') {
    objectField = React.createElement(Dropdown, {
      options: ['ANYTHING', 'NOTHING', 'DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA'],
      selected: conditionObject,
      onChange: function onChange(obj) {
        behavior.condition.payload.object = obj;
        setBehavior(behavior);
      }
    });
  }
  if (typeName === 'NEIGHBORING') {
    objectField = React.createElement(Dropdown, {
      options: ['MARKED_DIRT', 'DIRT', 'FOOD', 'TRAIL', 'EGG', 'LARVA', 'PUPA', 'ANYTHING', 'NOTHING'].concat(getEntitiesByType(state.game, ['LOCATION']).map(function (l) {
        return l.name;
      })),
      selected: conditionObject,
      onChange: function onChange(obj) {
        behavior.condition.payload.object = obj;
        setBehavior(behavior);
      }
    });
  }

  return React.createElement(
    'span',
    null,
    'Not: ',
    React.createElement(Checkbox, { checked: condition.not, onChange: function onChange(check) {
        behavior.condition.not = check;
        setBehavior(behavior);
      } }),
    React.createElement(Dropdown, {
      options: comparatorOptions,
      selected: comparator,
      onChange: function onChange(newComparator) {
        behavior.condition.comparator = newComparator;
        setBehavior(behavior);
      }
    }),
    objectField
  );
}

//////////////////////////////////////////////////////////////////////////////
// Do Action
//////////////////////////////////////////////////////////////////////////////
function DoActionCard(props) {
  var state = props.state,
      behavior = props.behavior,
      setBehavior = props.setBehavior;

  var actionType = behavior.action.type;
  var actionOptions = [];
  var actionPreposition = '';
  switch (actionType) {
    case 'MOVE':
      actionPreposition = 'towards: ';
      actionOptions = ['RANDOM', 'TRAIL'].concat(getEntitiesByType(state.game, ['LOCATION']).map(function (l) {
        return l.name;
      }));
      break;
    case 'PICKUP':
      actionOptions = ['DIRT', 'MARKED_DIRT', 'BLOCKER', 'FOOD', 'EGG', 'LARVA', 'PUPA'];
      break;
    case 'PUTDOWN':
      break;
    case 'IDLE':
      actionOptions = [];
      break;
    // TODO
  }
  var selectedObject = behavior.action.payload.object;
  if (selectedObject == null) {
    selectedObject = 'NONE';
  }
  // for locations:
  if (selectedObject.name != null) {
    selectedObject = selectedObject.name;
  }
  if (selectedObject === 'TRAIL') {
    actionPreposition = 'following: ';
  }
  return React.createElement(
    'span',
    null,
    actionPreposition,
    React.createElement(Dropdown, {
      options: actionOptions,
      selected: selectedObject,
      onChange: function onChange(nextActionOption) {
        behavior.action.payload.object = nextActionOption;
        setBehavior(behavior);
      }
    })
  );
}

module.exports = BehaviorCard;