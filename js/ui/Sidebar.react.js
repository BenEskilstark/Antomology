// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const RadioPicker = require('./components/RadioPicker.react');
const Dropdown = require('./components/Dropdown.react');
const AntCard = require('./AntCard.react');
const TaskCard = require('./TaskCard.react');
const {getSelectedAntIDs} = require('../selectors/selectors');
const {useState, useMemo, useEffect} = React;

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
};

function Sidebar(props: Props): React.Node {
  const {state, dispatch} = props;
  const {game} = state;
  // TODO allow selecting eggs, larva, pupa
  const selectedAnts = getSelectedAntIDs(game).map(id => game.entities[id]);
  const antCards = selectedAnts.map(ant => (
    <AntCard state={state} ant={ant} dispatch={dispatch} key={'antCard_' + ant.id} />
  ));
  return (
    <div
      className="sidebar"
      style={{
        height: config.canvasHeight,
      }}
    >
      Left-click and drag will:
      <RadioPicker
        options={['SELECT', 'MARK', 'CREATE_LOCATION']}
        selected={game.userMode}
        onChange={(userMode) => dispatch({type: 'SET_USER_MODE', userMode})}
      />
      Right-click will cause selected ants to:
      <RadioPicker
        options={['PICKUP', 'EAT', 'FEED']}
        selected={game.antMode}
        onChange={(antMode) => dispatch({type: 'SET_ANT_MODE', antMode})}
      />
      <div
        style={{
          border: '1px solid black',
        }}
      >
        <div><b>Selected Ants</b></div>
        Assign to All Selected Ants:
        <Dropdown
          options={game.tasks.map(t => t.name)}
          selected={'NONE'}
          onChange={(nextName) => {
            if (selectedAnts.length == 0) return;
            const nextTask = game.tasks.filter(t => t.name === nextName)[0];
            dispatch({type: 'ASSIGN_TASK', task: nextTask, ants: getSelectedAntIDs(game)});
          }}
        />
        {antCards}
        <TaskEditor {...props} />
      </div>
    </div>
  );
}

function TaskEditor(props: Props): React.Node {
  const {state, dispatch} = props;
  const {game} = state;

  const [taskName, setTaskName] = useState('New Task');
  const editingTask = useMemo(() => {
    return taskName === 'New Task'
      ? {name: 'New Task', repeating: false, behaviorQueue: []}
      : game.tasks.filter(t => t.name === taskName)[0];
    }, [taskName]
  );
  return (
    <div
      className="taskEditor"
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>Task Editor</b></div>
      Edit Task: <Dropdown
        options={['New Task'].concat(game.tasks.map(t => t.name))}
        selected={taskName}
        onChange={setTaskName}
      />

      <TaskCard
        state={state}
        dispatch={dispatch}
        newTask={taskName === 'New Task'}
        task={editingTask}
      />
    </div>
  );
}

module.exports = Sidebar;
