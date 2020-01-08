// @flow

const React = require('react');
const {config} = require('../config');
const Dropdown = require('./components/Dropdown.react');
const Button = require('./components/Button.react');

import type {Ant, State, Action} from '../types';

type Props = {
  state: State,
  ant: Ant,
  dispatch: (action: Action) => Action,
}

function AntCard(props: Props): React.Node {
  const {state, dispatch, ant} = props;

  const hungryStr =
    ant.calories < config.antStartingCalories * config.antStarvationWarningThreshold
    ? ' - Hungry'
    : '';

  return (
    <div
      className="antCard"
      style={{
        border: '1px solid black',
      }}
    >
      <div><b>{ant.subType}</b></div>
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
      <Button
        label="Deselect"
        onClick={() => {
          dispatch({
            type: 'SET_SELECTED_ENTITIES',
            entityIDs: state.game.selectedEntities.filter(id => id != ant.id),
          });
        }}
      />
      </div>
    </div>
  );
};

module.exports = AntCard;
