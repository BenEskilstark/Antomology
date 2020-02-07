// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const {getEntitiesByType} = require('../selectors/selectors');
const {useState, useEffect} = React;

import type {Ant, State, Action, Behavior, Task} from '../types';

type Props = {
  state: State,
  behavior: Behavior,
};

function BehaviorCard(props: Props): React.Node {
  const {state} = props;
  if (props.behavior == null) {
    return null;
  }
  // mutating the copy of behavior, but then also re-setting it to itself for re-rendering
  const [behavior, setBehavior] = useState(props.behavior);
  useEffect(() => {
    setBehavior(props.behavior);
  }, [props.behavior]);

  let selectedSubject = '';
  let subjects = [];
  if (behavior.type == 'DO_ACTION') {
    subjects = ['MOVE', 'PICKUP', 'PUTDOWN', 'IDLE', 'EAT', 'FEED', 'LAY'];
    selectedSubject = behavior.action.type;
  } else if (behavior.type == 'IF' || behavior.type == 'WHILE') {
    subjects = [
      'LOCATION', 'RANDOM', 'HOLDING', 'NEIGHBORING', 'BLOCKED',
      'CALORIES', 'AGE', 'IS_QUEEN',
    ];
    selectedSubject = behavior.condition.type;
  } else if (behavior.type == 'SWITCH_TASK') {
    subjects = state.game.tasks.map(t => t.name);
    selectedSubject = behavior.task;
  } else if (behavior.type == 'DO_HIGH_LEVEL_ACTION') {
    subjects = ['MOVE', 'PICKUP', 'PUTDOWN', 'EAT', 'FEED', 'LAY', 'FIND_PHEROMONE'];
    selectedSubject = behavior.action.type;
  }
  return (
    <div
      className="behaviorCard"
      style={{}}
    >
      <Dropdown
        options={['DO_ACTION', 'DO_HIGH_LEVEL_ACTION', 'IF', 'WHILE', 'SWITCH_TASK']}
        selected={behavior.type}
        onChange={(newType) => {
          const newBehavior = transitionBehavior(behavior, newType);
          setBehavior(newBehavior);
        }}
      />
      <Dropdown
        options={subjects}
        selected={selectedSubject}
        onChange={(nextSubject) => {
          if (
            behavior.type == 'DO_ACTION' || behavior.type == 'DO_HIGH_LEVEL_ACTION'
          ) {
            behavior.action.type = nextSubject;
          } else if (behavior.type === 'IF' || behavior.type === 'WHILE') {
            behavior.condition.type = nextSubject;
          } else {
            behavior.task = nextSubject;
          }
          setBehavior(behavior);
        }}
      />
      {
        behavior.type == 'DO_ACTION' || behavior.type == 'DO_HIGH_LEVEL_ACTION'
          ? <DoActionCard
              state={state}
              behavior={behavior}
              setBehavior={setBehavior}
            />
          : null
      }
      {
        behavior.type === 'IF' || behavior.type === 'WHILE'
          ? <Conditional
              state={state}
              condition={behavior.condition}
              behavior={behavior}
              setBehavior={setBehavior}
            />
          : null
      }
      {
        behavior.type === 'IF'
          ? <span>
              Then: <div style={{paddingLeft: 10}}><BehaviorCard
                state={state} behavior={behavior.behavior}
              /></div>
              Else: <div style={{paddingLeft: 10}}><BehaviorCard
                state={state} behavior={behavior.elseBehavior}
              /></div>
            </span>
          : null
      }
      {
        behavior.type === 'WHILE'
          ? <span>
              Do: <div style={{paddingLeft: 10}}><BehaviorCard
                state={state} behavior={behavior.behavior}
              /></div>
            </span>
          : null
      }
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////
// Behavior Transition
//////////////////////////////////////////////////////////////////////////////
function transitionBehavior(behavior: Behavior, newType: string): Behavior {
  const newBehavior = behavior;
  delete newBehavior.action;
  delete newBehavior.condition;
  delete newBehavior.task;
  delete newBehavior.elseBehavior;
  newBehavior.type = newType;
  switch (newType) {
    case 'DO_ACTION': {
      newBehavior.action = {
        type: 'IDLE',
        payload: {
          object: null,
        },
      };
      break;
    }
    case 'IF': {
      newBehavior.condition = {
        type: 'RANDOM',
        comparator: 'EQUALS',
        not: false,
        payload: {
          object: 1,
        },
      }
      newBehavior.behavior = {
        type: 'DO_ACTION',
        action: {
          type: 'IDLE',
          payload: {
            object: null,
          },
        },
      }
      newBehavior.elseBehavior = {
        type: 'DO_ACTION',
        action: {
          type: 'IDLE',
          payload: {
            object: null,
          },
        },
      }
      break;
    }
    case 'WHILE': {
      newBehavior.condition = {
        type: 'RANDOM',
        comparator: 'EQUALS',
        not: false,
        payload: {
          object: 1,
        },
      }
      newBehavior.behavior = {
        type: 'DO_ACTION',
        action: {
          type: 'IDLE',
          payload: {
            object: null,
          },
        },
      }
      break;
    }
    case 'SWITCH_TASK': {
      newBehavior.task = 'Idle';
      break;
    }
    case 'DO_HIGH_LEVEL_ACTION': {
      newBehavior.action = {
        type: 'MOVE',
        payload: {
          object: 'RANDOM',
        },
      };
      break;
    }
  }
  return newBehavior;
}

//////////////////////////////////////////////////////////////////////////////
// Conditional
//////////////////////////////////////////////////////////////////////////////
function Conditional(
  props: {
    state: State,
    condition: Condition,
    behavior: mixed,
    setBehavior: mixed => void,
  },
): React.Node {
  const {condition, state, behavior, setBehavior} = props;
  const typeName = condition.type;
  let conditionObject = condition.payload.object;
  if (conditionObject != null && conditionObject.name != null) {
    conditionObject = conditionObject.name;
  }
  const comparator = condition.comparator;
  let comparatorOptions = ['EQUALS', 'LESS_THAN', 'GREATER_THAN'];
  if (
    typeName == 'LOCATION' || typeName === 'HOLDING' ||
    typeName === 'NEIGHBORING' || typeName === 'BLOCKED'
  ) {
    comparatorOptions = ['EQUALS'];
  }
  let objectField = 'True';
  if (typeName === 'RANDOM' || typeName === 'CALORIES' || typeName === 'AGE') {
    objectField = <input type="text"
      value={conditionObject}
      onChange={(ev) => {
        const val = ev.target.value;
        if (val == '' || val[val.length - 1] === '.') {
          behavior.condition.payload.object = val;
        } else if (parseFloat(val) == NaN) {
          console.log(val);
          return;
        } else {
          behavior.condition.payload.object = parseFloat(val);
        }
        setBehavior(behavior);
      }}
    />;
  }
  if (typeName === 'LOCATION') {
    objectField = <Dropdown
      options={getEntitiesByType(state.game, ['LOCATION']).map(l => l.name)}
      selected={conditionObject}
      onChange={(locName) => {
        behavior.condition.payload.object = locName;
        setBehavior(behavior);
      }}
    />
  }
  if (typeName === 'HOLDING') {
    objectField = <Dropdown
      options={['ANYTHING', 'NOTHING', 'DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA']}
      selected={conditionObject}
      onChange={(obj) => {
        behavior.condition.payload.object = obj;
        setBehavior(behavior);
      }}
    />
  }
  if (typeName === 'NEIGHBORING') {
    objectField = <Dropdown
      options={
        ['MARKED_DIRT', 'DIRT', 'FOOD', 'TRAIL', 'EGG', 'LARVA', 'PUPA', 'ANYTHING', 'NOTHING']
        .concat(getEntitiesByType(state.game, ['LOCATION']).map(l => l.name))
      }
      selected={conditionObject}
      onChange={(obj) => {
        behavior.condition.payload.object = obj;
        setBehavior(behavior);
      }}
    />
  }

  return (
    <span>
      Not: <Checkbox checked={condition.not} onChange={(check) => {
        behavior.condition.not = check;
        setBehavior(behavior);
      }} />
      <Dropdown
        options={comparatorOptions}
        selected={comparator}
        onChange={(newComparator) => {
          behavior.condition.comparator = newComparator;
          setBehavior(behavior);
        }}
      />
      {objectField}
    </span>
  );
}

//////////////////////////////////////////////////////////////////////////////
// Do Action
//////////////////////////////////////////////////////////////////////////////
function DoActionCard(props: mixed): React.Node {
  const {state, behavior, setBehavior} = props;
  const actionType = behavior.action.type;
  let actionOptions = [];
  let actionPreposition = '';
  switch (actionType) {
    case 'MOVE':
      actionPreposition = 'towards: ';
      actionOptions = ['RANDOM', 'TRAIL']
        .concat(getEntitiesByType(state.game, ['LOCATION']).map(l => l.name));
      break;
    case 'PICKUP':
      actionOptions = ['DIRT', 'MARKED_DIRT', 'BLOCKER', 'FOOD', 'EGG', 'LARVA', 'PUPA'];
      break
    case 'PUTDOWN':
      break;
    case 'IDLE':
      actionOptions = [];
      break;
    // TODO
  }
  let selectedObject = behavior.action.payload.object;
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
  return (
    <span>
      {actionPreposition}
      <Dropdown
        options={actionOptions}
        selected={selectedObject}
        onChange={(nextActionOption) => {
          behavior.action.payload.object = nextActionOption;
          setBehavior(behavior);
        }}
      />
    </span>
  );
}

module.exports = BehaviorCard;
