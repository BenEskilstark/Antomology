// @flow

const {initState} = require('../state/initState');
const {initGameState} = require('../state/initGameState');
const {gameReducer} = require('./gameReducer');
const {editorReducer} = require('./editorReducer');
const {tickReducer} = require('./tickReducer');
const {modalReducer} = require('./modalReducer');

import type {State, Action} from '../types';

const rootReducer = (state: State, action: Action): State => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'START': {
      const {level} = action;
      const game = initGameState(level);
      let maxEntityID = 0;
      for (const id in game.entities) {
        if (id > maxEntityID) {
          maxEntityID = id;
        }
      }
      // HACK: available from entities/entity via window
      nextID = maxEntityID + 1;
      return {
        ...state,
        mode: 'GAME',
        game,
      };
    }
    case 'START_EDITOR': {
      return {
        ...state,
        mode: 'EDITOR',
        game: {
          ...initGameState(-1), // base level
          fog: false,
        },
        editor: {
          editorMode: 'CREATE_ENTITY',
          entityType: 'DIRT',
          antSubType: 'QUEEN',
          backgroundType: 'SKY',
          allowDeleteBackground: true,
        }
      };
    }
    case 'SET_EDITOR_MODE':
    case 'SET_EDITOR_ENTITY':
    case 'SET_EDITOR_ANT_SUBTYPE':
    case 'SET_EDITOR_BACKGROUND_TYPE':
    case 'SET_EDITOR_ALLOW_DELETE_BACKGROUND':
      if (!state.editor) return state;
      return {
        ...state,
        editor: editorReducer(state.editor, action),
      };
    case 'SET_HOTKEY': {
      const {key, press, fn} = action;
      state.game.hotKeys[press][key] = fn;
      return state;
    }
    case 'SET_KEY_PRESS': {
      const {key, pressed} = action;
      state.game.hotKeys.keysDown[key] = pressed;
      return state;
    }
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'START_TICK':
    case 'STOP_TICK':
    case 'TICK': {
      if (!state.game) return state;
      const game = tickReducer(state.game, action);
      if (game.gameOver === 'win') {
        // TODO replace this with game over system
        console.log('game won');
      }
      return {
        ...state,
        game,
      };
    }
    case 'APPLY_GAME_STATE':
      const {game} = action;
      let maxEntityID = 0;
      for (const id in game.entities) {
        if (id > maxEntityID) {
          maxEntityID = id;
        }
      }
      // HACK: available from entities/entity via window
      nextID = maxEntityID + 1;
      return {
        ...state,
        game,
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
    case 'TOGGLE_FOG':
    case 'SET_WORLD_SIZE':
    case 'SET_KEY_PRESS':
    case 'SET_PHEROMONE_STRENGTH':
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
