'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../state/initState'),
    initState = _require.initState;

var _require2 = require('../state/initGameState'),
    initGameState = _require2.initGameState;

var _require3 = require('./gameReducer'),
    gameReducer = _require3.gameReducer;

var _require4 = require('./editorReducer'),
    editorReducer = _require4.editorReducer;

var _require5 = require('./tickReducer'),
    tickReducer = _require5.tickReducer;

var _require6 = require('./modalReducer'),
    modalReducer = _require6.modalReducer;

var neoLevel1 = require('../levels/neoLevel1');

var rootReducer = function rootReducer(state, action) {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'START':
      {
        var level = action.level;

        var _game = initGameState(level);
        // let maxEntityID = 0;
        // for (const id in game.entities) {
        //   if (id > maxEntityID) {
        //     maxEntityID = id;
        //   }
        // }
        // HACK: available from entities/entity via window
        // nextID = maxEntityID + 1
        var levelActions = [];
        switch (level) {
          case 1:
            levelActions = neoLevel1.level();
            break;
        }
        return _extends({}, state, {
          levelActions: levelActions,
          mode: 'GAME',
          game: _game
        });
      }
    case 'START_EDITOR':
      {
        return _extends({}, state, {
          mode: 'EDITOR',
          game: _extends({}, initGameState(-1), { // base level
            fog: false
          }),
          editor: {
            editorMode: 'MARQUEE_ENTITY',
            entityType: 'BACKGROUND',
            antSubType: 'QUEEN',
            backgroundType: 'SKY',
            allowDeleteBackground: true,
            actions: []
          }
        });
      }
    case 'RETURN_TO_MENU':
      return _extends({}, state, {
        mode: 'MENU',
        game: null,
        editor: null
      });
    case 'SET_EDITOR_MODE':
    case 'SET_EDITOR_ENTITY':
    case 'SET_EDITOR_ANT_SUBTYPE':
    case 'SET_EDITOR_BACKGROUND_TYPE':
    case 'SET_EDITOR_ALLOW_DELETE_BACKGROUND':
      if (!state.editor) return state;
      return _extends({}, state, {
        editor: editorReducer(state.editor, action)
      });
    case 'SET_HOTKEY':
      {
        var key = action.key,
            press = action.press,
            fn = action.fn;

        state.game.hotKeys[press][key] = fn;
        return state;
      }
    case 'SET_KEY_PRESS':
      {
        var _key = action.key,
            pressed = action.pressed;

        state.game.hotKeys.keysDown[_key] = pressed;
        return state;
      }
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'START_TICK':
    case 'STOP_TICK':
    case 'TICK':
      {
        if (!state.game) return state;
        var _game2 = tickReducer(state.game, action);
        return _extends({}, state, {
          game: _game2
        });
      }
    case 'APPLY_GAME_STATE':
      var game = action.game;

      var maxEntityID = 0;
      for (var id in game.entities) {
        if (id > maxEntityID) {
          maxEntityID = id;
        }
      }
      // HACK: available from entities/entity via window
      nextID = maxEntityID + 1;
      return _extends({}, state, {
        game: game
      });
    case 'HYDRATE_GAME':
      if (!state.game) return state;
      return _extends({}, state, {
        game: _extends({}, state.game, {
          hydrated: true
        })
      });
    case 'CREATE_ENTITY':
    case 'CREATE_MANY_ENTITIES':
    case 'DESTROY_ENTITY':
      if (state.editor != null) {
        state.editor.actions.push(action);
      }
    // fall through on purpose
    case 'SET_SELECTED_ENTITIES':
    case 'CREATE_TASK':
    case 'UPDATE_TASK':
    case 'UPDATE_LOCATION_NAME':
    case 'UPDATE_NEXT_LOCATION_NAME':
    case 'UPDATE_LOCATION_TASK':
    case 'ASSIGN_TASK':
    case 'SET_USER_MODE':
    case 'SET_ANT_MODE':
    case 'SET_INFO_TAB':
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
    case 'SET_PHEROMONE_CONDITION':
    case 'ZOOM':
    case 'SET_TICKER':
    case 'SET_GAME_OVER':
    case 'SET_HOVER_CARD_JSX':
    case 'SET_HOVER_CARD_TIME':
      if (!state.game) return state;
      return _extends({}, state, {
        game: gameReducer(state.game, action)
      });
  }
  return state;
};

module.exports = { rootReducer: rootReducer };