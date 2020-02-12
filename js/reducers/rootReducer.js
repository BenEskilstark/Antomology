// @flow

const {initState} = require('../state/initState');
const {initGameState} = require('../state/initGameState');
const {gameReducer} = require('./gameReducer');
const {tickReducer} = require('./tickReducer');
const {modalReducer} = require('./modalReducer');

import type {State, Action} from '../types';

const rootReducer = (state: State, action: Action): State => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'START': {
      const {level} = action;
      return {
        ...state,
        mode: 'GAME',
        game: initGameState(level),
      };
    }
    case 'START_EDITOR': {
      return {
        ...state,
        mode: 'EDITOR',
        game: initGameState(-1), // base level
        editor: {
          editorMode: 'CREATE_ENTITY',
          entityType: 'DIRT',
        }
      };
    }
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'START_TICK':
    case 'STOP_TICK':
    case 'TICK':
      if (!state.game) return state;
      return {
        ...state,
        game: tickReducer(state.game, action),
      };
    case 'CREATE_ENTITY':
    case 'DESTROY_ENTITY':
    case 'SET_SELECTED_ENTITIES':
    case 'CREATE_TASK':
    case 'UPDATE_TASK':
    case 'UPDATE_LOCATION_NAME':
    case 'UPDATE_NEXT_LOCATION_NAME':
    case 'UPDATE_LOCATION_TASK':
    case 'ASSIGN_TASK':
    case 'SET_USER_MODE':
    case 'SET_ANT_MODE':
    case 'SET_MOUSE_DOWN':
    case 'SET_MOUSE_POS':
    case 'UPDATE_THETA':
    case 'SET_PREV_PHEROMONE':
    case 'CREATE_EDGE':
    case 'UPDATE_EDGE':
    case 'SET_CUR_EDGE':
    case 'SET_VIEW_POS':
    case 'ZOOM':
      if (!state.game) return state;
      return {
        ...state,
        game: gameReducer(state.game, action),
      };
  }
  return state;
};

module.exports = {rootReducer}
