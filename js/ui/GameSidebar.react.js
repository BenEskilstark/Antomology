// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const RadioPicker = require('./components/RadioPicker.react');
const Dropdown = require('./components/Dropdown.react');
const Slider = require('./components/Slider.react');
const StatusCard = require('./StatusCard.react');
const {getSelectedAntIDs} = require('../selectors/selectors');
const {useState, useMemo, useEffect} = React;

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
};

function GameSidebar(props: Props): React.Node {
  const {state, dispatch} = props;
  const {game} = state;
  const selectedEntities = game.selectedEntities.map(id => game.entities[id]);
  const selectionCards = selectedEntities.map(entity => (
    <StatusCard
      state={state} entity={entity} dispatch={dispatch}
      key={'statusCard_' + entity.id} />
  ));
  return (
    <div
      style={{
        border: '1px solid black',
        display: 'inline-block',
        width: 500,
        position: 'absolute',
        left: config.canvasWidth,
        height: config.canvasHeight,
        overflowY: 'scroll',
      }}
    >
      <div><b>Controls</b></div>
      <div>
        Left-click and drag will:
        <Dropdown
          noNoneOption={true}
          options={['SELECT', 'CREATE_LOCATION', 'DELETE_LOCATION']}
          selected={game.userMode}
          onChange={(userMode) => dispatch({type: 'SET_USER_MODE', userMode})}
        />
        {
          game.userMode === 'CREATE_LOCATION'
            ? <input type='text' value={game.nextLocationName}
                onChange={(ev) => {
                  dispatch({type: 'UPDATE_NEXT_LOCATION_NAME', name: ev.target.value});
                }} />
            : null
        }
      </div>
      <div>
        Right-click will cause selected ants to:
        <Dropdown
          noNoneOption={true}
          options={['PICKUP', 'EAT', 'FEED']}
          selected={game.antMode}
          onChange={(antMode) => dispatch({type: 'SET_ANT_MODE', antMode})}
        />
      </div>
      <div>
        <Slider
          min={-1 * config.pheromoneMaxQuantity}
          max={config.pheromoneMaxQuantity}
          value={game.selectedAntPheromoneStrength}
          step={20}
          label={'Ant Pheromone Strength: '}
          onChange={(strength) => {
            dispatch({type: 'SET_PHEROMONE_STRENGTH', selected: true, strength});
          }}
        />
        <Button
          label="Set to 0"
          onClick={() => {
            dispatch({type: 'SET_PHEROMONE_STRENGTH', selected: true, strength: 0});
          }}
        />
      </div>
      {selectionCards}
    </div>
  );
}

function AssignToAllAntsCard(game, dispatch, selectedEntities) {
  return (
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
          if (selectedEntities.length == 0) return;
          const nextTask = game.tasks.filter(t => t.name === nextName)[0];
          dispatch(
            {type: 'ASSIGN_TASK', task: nextTask, ants: getSelectedAntIDs(game)}
          );
        }}
      />
    </div>
  )
}

module.exports = GameSidebar;
