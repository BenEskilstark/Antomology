// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const Dropdown = require('./components/Dropdown.react');
const RadioPicker = require('./components/RadioPicker.react');
const Slider = require('./components/Slider.react');
const StatusCard = require('./StatusCard.react');
const {useState, useMemo, useEffect} = React;

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
};

const PADDING = 4;

const tabStyle = {
  backgroundColor: 'white',
  padding: '3px',
  marginTop: 1,
}

const barStyle = {
  backgroundColor: 'white',
  padding: '3px',
};

function InfoSidebar(props: Props): React.Node {
  const {state, dispatch} = props;
  const {game} = state;
  const {infoTab} = game;

  let infoBar = null;
  switch (infoTab) {
    case 'Pheromones':
      infoBar = PheromoneTab(props);
      break;
    case 'Locations':
      infoBar = LocationTab(props);
      break;
    case 'Colony Status':
      infoBar = StatusTab(props);
      break;
    case 'Options':
      infoBar = OptionsTab(props);
      break;
  }

  return (
    <div
      style={{
        width: 400,
        position: 'absolute',
        left: PADDING,
        top: PADDING,
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          width: '100%',
          padding: '3px',
        }}
      >
        Left-click and drag:
        <Dropdown
          noNoneOption={true}
          options={['SELECT', 'CREATE_LOCATION', 'DELETE_LOCATION']}
          displayOptions={['Select [Z]', 'Create Location [C]', 'Delete Location [X]']}
          selected={game.userMode}
          onChange={(userMode) => dispatch({type: 'SET_USER_MODE', userMode})}
        />
        {game.userMode === 'CREATE_LOCATION' ?
          <div>
            <input type='text' value={game.nextLocationName}
              onChange={(ev) => {
                dispatch({type: 'UPDATE_NEXT_LOCATION_NAME', name: ev.target.value});
              }}
            />
          </div>
          : null
        }
      </div>
      <div
        style={tabStyle}
      >
        Info Tab:
        <Dropdown
          noNoneOption={true}
          options={['Colony Status', 'Locations', 'Pheromones', 'Options', 'None']}
          displayOptions={[
            'Colony Status [U]',
            'Locations [L]',
            'Pheromones [H]',
            'Options [K]',
            'None [N]',
          ]}
          selected={infoTab}
          onChange={(nextInfoTab) => {
            dispatch({type: 'SET_INFO_TAB', infoTab: nextInfoTab});
          }}
        />
      </div>
      {infoBar}
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////
// Pheromones
/////////////////////////////////////////////////////////////////////////////
function PheromoneTab(props: Props) {
  const {state, dispatch} = props;
  const {game} = state;

  return (
    <div
      style={barStyle}
    >
      <b>Pheromones</b>
      <div>
        Hold indicated key while commanding selected ants and they will create
        a pheromone trail of that color wherever they go.
      </div>
      <div>
        Create a condition for a trail to allow only ants that satisfy the condition
        to follow it.
      </div>
      <div>
        Use negative trail strength to delete trails.
      </div>
      {pheromoneCategory(game, dispatch, 1)}
      {pheromoneCategory(game, dispatch, 2)}
      {pheromoneCategory(game, dispatch, 3)}
    </div>
  );
}

function pheromoneCategory(game: GameState, dispatch, category) {
  const strength = game.pheromones[category].strength;
  const condition = game.pheromones[category].condition;
  let label = '';
  switch (category) {
    case 1:
      label = 'Green [P]';
      break;
    case 2:
      label = 'Blue [O]';
      break;
    case 3:
      label = 'Red [I]';
      break;
  }
  return (
    <div
      style={{borderTop: '1px solid black'}}
    >
      Type: {label}
      <Slider
        min={-1 * config.pheromoneMaxQuantity}
        max={config.pheromoneMaxQuantity}
        step={20}
        value={strength}
        label={'Strength: '}
        onChange={(str) => {
          dispatch({type: 'SET_PHEROMONE_STRENGTH', category, strength: str});
        }}
      />
      Condition:
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////
// Locations
/////////////////////////////////////////////////////////////////////////////
function LocationTab(props: Props) {
  const {state, dispatch} = props;
  const {game} = state;

  const locationCards = game.selectedEntities
    .map(id => game.entities[id])
    .filter(e => e.type === 'LOCATION')
    .map(entity => (
      <StatusCard
        state={state} entity={entity} dispatch={dispatch}
        key={'locationStatusCard_' + entity.id}
      />
    ));

  return (
    <span>
      <div
        style={barStyle}
      >
        <b>Selected Locations</b>
      </div>
      {locationCards}
    </span>
  );
}

/////////////////////////////////////////////////////////////////////////////
// Status
/////////////////////////////////////////////////////////////////////////////
function StatusTab(props: Props) {
  const {state, dispatch} = props;
  const {game} = state;

  const numAnts = game.ANT
    .map(id => game.entities[id])
    .filter(a => a.alive)
    .length;

  const numEggs = game.EGG
    .map(id => game.entities[id])
    .filter(a => a.alive)
    .length;

  const numLarva = game.LARVA
    .map(id => game.entities[id])
    .filter(a => a.alive)
    .length;

  const numPupa = game.PUPA
    .map(id => game.entities[id])
    .filter(a => a.alive)
    .length;

  return (
    <div
      style={barStyle}
    >
      <b>Colony Status</b>
      <div>
        Ants: {numAnts}
      </div>
      <div>
        Eggs: {numEggs}
      </div>
      <div>
        Larva: {numLarva}
      </div>
      <div>
        Pupa: {numPupa}
      </div>
      <Button
        label="Select Queen [Q]"
        onClick={() => {
          const queenID = game.ANT
            .map(id => game.entities[id])
            .filter(a => a.subType === 'QUEEN')
            [0].id;
          dispatch({type: 'SET_SELECTED_ENTITIES', entityIDs: [queenID]});
        }}
      />

    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////
// Options
/////////////////////////////////////////////////////////////////////////////
function OptionsTab(props: Props) {
  const {state, dispatch} = props;
  const {game} = state;

  const isPaused = game.tickInterval == null;

  return (
    <div
      style={barStyle}
    >
      <b>Options</b>
      <div>
        <Button
          label={isPaused ? "Resume [Space]" : "Pause [Space]"}
          onClick={() => {
            if (isPaused) {
              dispatch({type: 'START_TICK', updateSim: true});
            } else {
              dispatch({type: 'STOP_TICK'});
            }
          }}
        />
        <Button
          label="Restart Level"
          onClick={() => {
            dispatch({type: 'STOP_TICK'});
            dispatch({type: 'START', level: game.level});
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
        <Button
          label="Quit to Menu"
          onClick={() => {
            dispatch({type: 'STOP_TICK'});
            dispatch({type: 'RETURN_TO_MENU'});
          }}
        />
      </div>
    </div>
  );
}

module.exports = InfoSidebar;
