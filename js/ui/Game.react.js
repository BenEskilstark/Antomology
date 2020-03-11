// @flow

const React = require('react');
const Canvas = require('./Canvas.react');
const InfoSidebar = require('./InfoSidebar.react');
const SelectionSidebar = require('./SelectionSidebar.react');
const {useEffect} = React;
const {createLayEggTask} = require('../state/tasks');
const {config} = require('../config');
const {getQueen} = require('../selectors/selectors');

import type {Action, State} from '../types';

type Props = {
  width: number,
  height: number,
  dispatch: (action: Action) => Action,
  state: State,
};

function Game(props: Props): React.Node {
  const {dispatch, state} = props;

  //////////////////////////////////////////////////////////////////////////////
  // Register hotkeys
  // TODO: clean these up
  //////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch({
      type: 'SET_HOTKEY',
      press: 'onKeyDown',
      key: 'space',
      fn: (s) => {
        const state = s.getState();
        const isPaused = state.game.tickInterval == null;
        if (isPaused) {
          s.dispatch({type: 'START_TICK', updateSim: true});
        } else {
          s.dispatch({type: 'STOP_TICK'});
        }
      }
    });

    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'E',
      fn: (s) => s.dispatch({type: 'SET_ANT_MODE', antMode: 'EAT'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'F',
      fn: (s) => s.dispatch({type: 'SET_ANT_MODE', antMode: 'FEED'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'R',
      fn: (s) => s.dispatch({type: 'SET_ANT_MODE', antMode: 'PICKUP'}),
    });

    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'Z',
      fn: (s) => s.dispatch({type: 'SET_USER_MODE', userMode: 'SELECT'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'C',
      fn: (s) => s.dispatch({type: 'SET_USER_MODE', userMode: 'CREATE_LOCATION'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'X',
      fn: (s) => s.dispatch({type: 'SET_USER_MODE', userMode: 'DELETE_LOCATION'}),
    });

    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'U',
      fn: (s) => s.dispatch({type: 'SET_INFO_TAB', infoTab: 'Colony Status'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'L',
      fn: (s) => s.dispatch({type: 'SET_INFO_TAB', infoTab: 'Locations'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'H',
      fn: (s) => s.dispatch({type: 'SET_INFO_TAB', infoTab: 'Pheromones'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'K',
      fn: (s) => s.dispatch({type: 'SET_INFO_TAB', infoTab: 'Options'}),
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'N',
      fn: (s) => s.dispatch({type: 'SET_INFO_TAB', infoTab: 'None'}),
    });

    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'Q',
      fn: (s) => {
        const game = s.getState().game;
        if (game == null) return;
        const queenID = getQueen(game).id;
        s.dispatch({type: 'SET_SELECTED_ENTITIES', entityIDs: [queenID]});
      }
    });
    dispatch({
      type: 'SET_HOTKEY', press: 'onKeyDown',
      key: 'G',
      fn: (s) => {
        const game = s.getState().game;
        if (game == null) return;
        const queenID = getQueen(game).id;
        s.dispatch({type: 'ASSIGN_TASK', task: createLayEggTask(), ants: [queenID]});
      }
    });
  }, []);

  const hoverCard = (
    <div
      style={{
        position: 'absolute',
        top: props.state.game.mouse.curPixel.y,
        left: props.state.game.mouse.curPixel.x,
      }}
    >
      {props.state.game.hoverCard.jsx}
    </div>
  );

  return (
    <div
      className="background" id="background"
      style={{
        position: 'relative',
      }}
    >
      <Canvas
        width={props.width} height={props.height}
      />
      <InfoSidebar state={props.state} dispatch={props.dispatch} />
      <SelectionSidebar state={props.state} dispatch={props.dispatch} />
      {props.state.game.hoverCard.jsx != null ? hoverCard : null}
    </div>
  );
}

module.exports = Game;
