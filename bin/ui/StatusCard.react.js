'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Dropdown = require('./components/Dropdown.react');
var Button = require('./components/Button.react');
var TaskCard = require('./TaskCard.react');

var _require2 = require('../selectors/selectors'),
    canLayEgg = _require2.canLayEgg;

var _require3 = require('../state/tasks'),
    createLayEggTask = _require3.createLayEggTask;

var useState = React.useState,
    useMemo = React.useMemo,
    useEffect = React.useEffect;


var cardStyle = {
  backgroundColor: 'white',
  padding: '3px',
  marginTop: 1
};

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
    case 'OBELISK':
      // card = <TaskEditor {...props} />;
      break;
    case 'LOCATION':
      card = React.createElement(LocationCard, props);
      break;
    case 'PHEROMONE':
      var edge = state.game.edges[entity.edge];
      if (edge.pheromones[0] === entity.id) {
        card = React.createElement(EdgeCard, props);
      }
      break;
  }

  return card;
}

function AntCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;
  var game = state.game;

  var ant = entity;

  var hungryStr = ant.calories < config.antMaxCalories * config.antStarvationWarningThreshold ? ' - Hungry' : '';
  var deadStr = ant.alive ? '' : 'DEAD ';
  var oldAgeStr = ant.age > config.antMaxAge * config.antOldAgeDeathWarningThreshold ? ' - Old' : '';

  var canLay = canLayEgg(game, ant);
  var layEggButton = React.createElement(
    'div',
    null,
    React.createElement(Button, {
      label: canLay === true ? "Lay Egg [G]" : "Lay Egg [G] (" + canLay + ")",
      disabled: canLay !== true,
      onClick: function onClick() {
        dispatch({
          type: 'ASSIGN_TASK', task: createLayEggTask(), ants: [ant.id]
        });
      }
    })
  );

  return React.createElement(
    'div',
    {
      style: cardStyle
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
      React.createElement(
        'b',
        null,
        'Calories:'
      ),
      ' ',
      ant.calories,
      hungryStr,
      oldAgeStr
    ),
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'HP:'
      ),
      ' ',
      ant.hp,
      '/',
      config.antStartingHP
    ),
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'DMG:'
      ),
      config.antDamage
    ),
    React.createElement(
      'div',
      null,
      'Current Task: ',
      ant.task != null ? ant.task.name : 'None',
      ant.subType === 'QUEEN' ? layEggButton : null,
      React.createElement(DeselectButton, props)
    )
  );
};

function DeselectButton(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  return React.createElement(
    'div',
    null,
    React.createElement(Button, {
      label: 'Deselect',
      onClick: function onClick() {
        dispatch({
          type: 'SET_SELECTED_ENTITIES',
          entityIDs: state.game.selectedEntities.filter(function (id) {
            return id != entity.id;
          })
        });
      }
    })
  );
}

function EggCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  var egg = entity;

  return React.createElement(
    'div',
    {
      style: cardStyle
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
      React.createElement(
        'b',
        null,
        'HP:'
      ),
      ' 10/10'
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
  var deadStr = larva.alive ? '' : 'DEAD ';

  return React.createElement(
    'div',
    {
      style: cardStyle
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
      React.createElement(
        'b',
        null,
        'HP:'
      ),
      ' 10/10'
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
      config.larvaEndCalories
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
      style: cardStyle
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

function LocationCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;

  var game = state.game;
  var loc = entity;

  // const incomingEdgeInfos = loc.incomingEdges
  //   .map(id => game.edges[id])
  //   .map(edge => {
  //     return (
  //       <div
  //         style={{paddingLeft: 10}}
  //         key={"inc_" + edge.id}
  //       >
  //         Source: {edge.start != null ? game.entities[edge.start].name : 'Not Set'}
  //       </div>
  //     );
  //   });
  // const outgoingEdgeInfos = loc.outgoingEdges
  //   .map(id => game.edges[id])
  //   .map(edge => {
  //     return (
  //       <div
  //         style={{paddingLeft: 10}}
  //         key={"out_" + edge.id}
  //       >
  //         <div>
  //           Destination: {edge.end != null ? game.entities[edge.end].name : 'Not Set'}
  //         </div>
  //         <div>
  //           Condition: TODO
  //         </div>
  //       </div>
  //     );
  //   });

  return React.createElement(
    'div',
    {
      style: cardStyle
    },
    React.createElement(
      'div',
      null,
      'Name: ',
      React.createElement('input', { type: 'text', value: loc.name,
        onChange: function onChange(ev) {
          dispatch({
            type: 'UPDATE_LOCATION_NAME',
            id: loc.id,
            newName: ev.target.value
          });
        } })
    ),
    React.createElement(
      'div',
      null,
      'Task:',
      React.createElement(TaskCard, {
        state: state,
        dispatch: dispatch,
        setTaskName: function setTaskName() {},
        newTask: false,
        task: loc.task,
        disableRename: true,
        disableImportExport: true,
        isLocationTask: true,
        entityID: loc.id
      })
    )
  );
}

function EdgeCard(props) {
  var state = props.state,
      dispatch = props.dispatch,
      entity = props.entity;
  var game = state.game;

  var edge = game.edges[entity.edge];
  var startLoc = game.entities[edge.start];

  var endLocName = edge.end != null ? game.entities[edge.end].name : 'Not Set';

  return React.createElement(
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
        'TRAIL'
      )
    ),
    React.createElement(
      'div',
      null,
      'From: ',
      startLoc.name
    ),
    React.createElement(
      'div',
      null,
      'To: ',
      endLocName
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
        border: '1px solid black',
        backgroundColor: 'white'
      }
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'THE OBELISK'
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
      task: editingTask,
      disableRename: false,
      disableImportExport: false,
      isLocationTask: false,
      entityID: null
    })
  );
}

module.exports = StatusCard;