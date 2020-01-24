// @flow

const React = require('react');
const {config} = require('../config');
const Dropdown = require('./components/Dropdown.react');
const Button = require('./components/Button.react');
const TaskCard = require('./TaskCard.react');

const {useState, useMemo, useEffect} = React;

import type {Ant, Entity, State, Action} from '../types';

type Props = {
  state: State,
  entity: Entity,
  dispatch: (action: Action) => Action,
}

function StatusCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  let card = null;
  switch (entity.type) {
    case 'ANT':
      card = <AntCard {...props} />;
      break;
    case 'EGG':
      card = <EggCard {...props} />;
      break;
    case 'LARVA':
      card = <LarvaCard {...props} />;
      break;
    case 'PUPA':
      card = <PupaCard {...props} />;
      break;
    case 'OBELISK':
      card = <TaskEditor {...props} />;
      break;
  }

  return card;
}

function AntCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const ant = entity;

  const hungryStr =
    ant.calories < config.antStartingCalories * config.antStarvationWarningThreshold
    ? ' - Hungry'
    : '';
  const deadStr = ant.alive ? '' : 'DEAD ';

  return (
    <div
      className="antCard"
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>{deadStr}{ant.subType} {ant.type}</b></div>
      <div>Calories: {ant.calories}{hungryStr}</div>
      <div>HP: 10/10</div>
      <div>
        Current Task:
        <Dropdown
          options={state.game.tasks.map(task => task.name)}
          selected={ant.task != null ? ant.task.name : null}
          onChange={(nextTaskName) => {
            const nextTask = state.game.tasks.filter(t => t.name === nextTaskName)[0];
            dispatch({type: 'ASSIGN_TASK', task: nextTask, ants: [ant.id]});
          }}
        />
        <DeselectButton {...props} />
      </div>
    </div>
  );
};

function DeselectButton(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  return (
    <Button
      label="Deselect"
      onClick={() => {
        dispatch({
          type: 'SET_SELECTED_ENTITIES',
          entityIDs: state.game.selectedEntities.filter(id => id != entity.id),
        });
      }}
    />
  );
}

function EggCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const egg = entity;

  return (
    <div
      className="antCard"
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>{egg.type}</b></div>
      <div>Time to hatch: {config.eggHatchAge - egg.age}</div>
      <div>HP: 10/10</div>
      <div>Will become: LARVA then {egg.subType} ANT</div>
      <DeselectButton {...props} />
    </div>
  );
}

function LarvaCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const larva = entity;

  const hungryStr =
    larva.calories < config.larvaStartingCalories * config.antStarvationWarningThreshold
    ? ' - Hungry'
    : '';
  const deadStr = larva.alive ? '' : 'DEAD ';

  return (
    <div
      className="antCard"
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>{deadStr}{larva.type}</b></div>
      <div>Calories: {larva.calories}{hungryStr}</div>
      <div>Calories needed to hatch: {config.larvaEndCalories - larva.calories}</div>
      <div>HP: 10/10</div>
      <div>Will become: PUPA then {larva.subType} ANT</div>
      <DeselectButton {...props} />
    </div>
  );
}

function PupaCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const pupa = entity;

  return (
    <div
      className="antCard"
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>{pupa.type}</b></div>
      <div>Time to hatch: {config.pupaHatchAge - pupa.age}</div>
      <div>HP: 10/10</div>
      <div>Will become: {pupa.subType} ANT</div>
      <DeselectButton {...props} />
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
      <div><b>THE OBELISK</b></div>
      Edit Task: <Dropdown
        noNoneOption={true}
        options={['New Task'].concat(game.tasks.map(t => t.name))}
        selected={taskName}
        onChange={setTaskName}
      />

      <TaskCard
        state={state}
        dispatch={dispatch}
        setTaskName={setTaskName}
        newTask={taskName === 'New Task'}
        task={editingTask}
      />
    </div>
  );
}

module.exports = StatusCard;
