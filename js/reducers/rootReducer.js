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
        game: initGameState(level),
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
    case 'UPDATE_NEXT_LOCATION_NAME':
    case 'ASSIGN_TASK':
    case 'SET_USER_MODE':
    case 'SET_ANT_MODE':
    case 'SET_MOUSE_DOWN':
    case 'SET_MOUSE_POS':
    case 'UPDATE_THETA':
    case 'SET_PREV_PHEROMONE':
    case 'SET_VIEW_POS':
      if (!state.game) return state;
      return {
        ...state,
        game: gameReducer(state.game, action),
      };
  }
  return state;
};

module.exports = {rootReducer}
