// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const Dropdown = require('./components/Dropdown.react');
const StatusCard = require('./StatusCard.react');
const {useState} = React;

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
};

const PADDING = 4;

function SelectionSidebar(props: Props): React.Node {
  const {state, dispatch} = props;
  const {game} = state;

  const [selectionHidden, setSelectionHidden] = useState(false);

  const selectionCards = game.selectedEntities
    .map(id => game.entities[id])
    .filter(e => e.type != 'LOCATION')
    .map(entity => (
      <StatusCard
        state={state} entity={entity} dispatch={dispatch}
        key={'statusCard_' + entity.id}
      />
    ));
  const selectedAntsLabel = selectionCards.length > 0
    ? <div style={{backgroundColor: 'white', padding: '3px', marginTop: 4}}>
        <b>Selected Ants</b>{" (" + selectionCards.length + ")"}<b>:</b>
        <Button
          label={selectionHidden ? 'Show Selection' : 'Hide Selection'}
          onClick={() => setSelectionHidden(!selectionHidden)}
        />
      </div>
    : null;

  return (
    <div
      style={{
        zIndex: 1,
        width: 400,
        position: 'absolute',
        left: config.canvasWidth - (400 + PADDING),
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
        Right-click commands ants to:
        <Dropdown
          noNoneOption={true}
          options={['PICKUP', 'EAT', 'FEED']}
          selected={game.antMode}
          displayOptions={['Pick up [R]', 'Eat [E]', 'Feed [F]']}
          onChange={(antMode) => dispatch({type: 'SET_ANT_MODE', antMode})}
        />
      </div>
      {selectedAntsLabel}
      {!selectionHidden ? selectionCards : null}
    </div>
  );
}

module.exports = SelectionSidebar;
