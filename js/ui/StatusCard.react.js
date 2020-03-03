// @flow

const React = require('react');
const {config} = require('../config');
const Dropdown = require('./components/Dropdown.react');
const Button = require('./components/Button.react');
const TaskCard = require('./TaskCard.react');
const {canLayEgg} = require('../selectors/selectors');
const {createLayEggTask} = require('../state/tasks');

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
    case 'LOCATION':
      card = <LocationCard {...props} />;
      break;
    case 'PHEROMONE':
      const edge = state.game.edges[entity.edge];
      if (edge.pheromones[0] === entity.id) {
        card = <EdgeCard {...props} />;
      }
      break;
  }

  return card;
}

function AntCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const {game} = state;
  const ant = entity;

  const hungryStr =
    ant.calories < config.antStartingCalories * config.antStarvationWarningThreshold
    ? ' - Hungry'
    : '';
  const deadStr = ant.alive ? '' : 'DEAD ';
  const oldAgeStr =
    ant.age > config.antMaxAge * config.antOldAgeDeathWarningThreshold
      ? ' - Old'
      : '';

  const canLay = canLayEgg(game, ant);
  const layEggButton = (
    <div>
    <Button
      label={canLay === true ? "Lay Egg" : "Lay Egg (" + canLay + ")"}
      disabled={canLay !== true}
      onClick={() => {
        dispatch({
          type: 'ASSIGN_TASK', task: createLayEggTask(), ants: [ant.id]
        });
      }}
    />
    </div>
  );

  return (
    <div
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>{deadStr}{ant.subType} {ant.type}</b></div>
      <div>Calories: {ant.calories}{hungryStr}{oldAgeStr}</div>
      <div>HP: 10/10</div>
      <div>
        Current Task: {ant.task != null ? ant.task.name : 'None'}
        {ant.subType === 'QUEEN' ? layEggButton : null}
        <DeselectButton {...props} />
      </div>
    </div>
  );
};

function DeselectButton(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  return (
    <div>
    <Button
      label="Deselect"
      onClick={() => {
        dispatch({
          type: 'SET_SELECTED_ENTITIES',
          entityIDs: state.game.selectedEntities.filter(id => id != entity.id),
        });
      }}
    />
    </div>
  );
}

function EggCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const egg = entity;

  return (
    <div
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
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>{deadStr}{larva.type}</b></div>
      <div>Calories: {larva.calories}{hungryStr}</div>
      <div>Calories needed to hatch: {config.larvaEndCalories}</div>
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

function LocationCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const game = state.game;
  const loc = entity;

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

  return (
    <div
      style={{
        border: '1px solid black',
      }}
    >
      <div>
        <b>LOCATION:</b><input type='text' value={loc.name}
          onChange={(ev) => {
            dispatch({
              type: 'UPDATE_LOCATION_NAME',
              id: loc.id,
              newName: ev.target.value,
            });
          }} />
      </div>
      <div>
        TASK:
        <TaskCard
          state={state}
          dispatch={dispatch}
          setTaskName={() => {}}
          newTask={false}
          task={loc.task}
          disableRename={true}
          disableImportExport={true}
          isLocationTask={true}
          entityID={loc.id}
        />
      </div>
    </div>
  );
}

function EdgeCard(props: Props): React.Node {
  const {state, dispatch, entity} = props;
  const {game} = state;
  const edge = game.edges[entity.edge];
  const startLoc = game.entities[edge.start];

  const endLocName = edge.end != null ? game.entities[edge.end].name : 'Not Set';

  return (
    <div
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>TRAIL</b></div>
      <div>From: {startLoc.name}</div>
      <div>To: {endLocName}</div>
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
        disableRename={false}
        disableImportExport={false}
        isLocationTask={false}
        entityID={null}
      />
    </div>
  );
}

module.exports = StatusCard;
