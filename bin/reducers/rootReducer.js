'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../state/initState'),
    initState = _require.initState;

var _require2 = require('../state/initGameState'),
    initGameState = _require2.initGameState;

var _require3 = require('./gameReducer'),
    gameReducer = _require3.gameReducer;

var _require4 = require('./tickReducer'),
    tickReducer = _require4.tickReducer;

var _require5 = require('./modalReducer'),
    modalReducer = _require5.modalReducer;

var rootReducer = function rootReducer(state, action) {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'START':
      return _extends({}, state, {
        game: initGameState()
      });
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'START_TICK':
    case 'STOP_TICK':
    case 'TICK':
      if (!state.game) return state;
      return _extends({}, state, {
        game: tickReducer(state.game, action)
      });
    case 'CREATE_ENTITY':
    case 'DESTROY_ENTITY':
    case 'CREATE_ANT':
    case 'DESTROY_ANT':
    case 'SET_SELECTED_ENTITIES':
    case 'CREATE_TASK':
    case 'ASSIGN_TASK':
    case 'SET_USER_MODE':
    case 'MARK_ENTITY':
    case 'SET_MOUSE_DOWN':
    case 'START_CREATE_LOCATION':
      if (!state.game) return state;
      return _extends({}, state, {
        game: gameReducer(state.game, action)
      });
  }
  return state;
};

module.exports = { rootReducer: rootReducer };