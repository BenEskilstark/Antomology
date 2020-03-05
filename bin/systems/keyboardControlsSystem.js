'use strict';

var _require = require('../config'),
    config = _require.config;

var done = false;
var initKeyboardControlsSystem = function initKeyboardControlsSystem(store) {
  if (done) return;
  done = true;
  var dispatch = store.dispatch;

  //////////////////////////////////////////////////////////////////////////////
  // Register hotkeys
  //////////////////////////////////////////////////////////////////////////////

  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'space',
    fn: function fn(s) {
      var state = s.getState();
      var isPaused = state.game.tickInterval == null;
      if (isPaused) {
        s.dispatch({ type: 'START_TICK', updateSim: true });
      } else {
        s.dispatch({ type: 'STOP_TICK' });
      }
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'E',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_ANT_MODE', antMode: 'EAT' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'F',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_ANT_MODE', antMode: 'FEED' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'R',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_ANT_MODE', antMode: 'PICKUP' });
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'Z',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_USER_MODE', userMode: 'SELECT' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'C',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_USER_MODE', userMode: 'CREATE_LOCATION' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'X',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_USER_MODE', userMode: 'DELETE_LOCATION' });
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'U',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Colony Status' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'L',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Locations' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'H',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Pheromones' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'K',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Options' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'N',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'None' });
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'Q',
    fn: function fn(s) {
      var game = s.getState().game;
      if (game == null) return;
      var queenID = game.ANT.map(function (id) {
        return game.entities[id];
      }).filter(function (a) {
        return a.subType === 'QUEEN';
      })[0].id;
      s.dispatch({ type: 'SET_SELECTED_ENTITIES', entityIDs: [queenID] });
    }
  });

  //////////////////////////////////////////////////////////////////////////////
  // keypress event handling
  //////////////////////////////////////////////////////////////////////////////
  document.onkeydown = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.game.hotKeys.onKeyDown[dir] != null) {
        state.game.hotKeys.onKeyDown[dir](store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: dir, pressed: true });
      return;
    }
    if (ev.keyCode === 13) {
      if (state.game.hotKeys.onKeyDown.enter != null) {
        state.game.hotKeys.onKeyDown.enter(store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: 'enter', pressed: true });
      return;
    }
    if (ev.keyCode === 32) {
      if (state.game.hotKeys.onKeyDown.space != null) {
        state.game.hotKeys.onKeyDown.space(store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: 'space', pressed: true });
      return;
    }
    var character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.game.hotKeys.onKeyDown[character] != null) {
        state.game.hotKeys.onKeyDown[character](store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: character, pressed: true });
    }
  };

  document.onkeypress = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.game.hotKeys.onKeyPress[dir] != null) {
        state.game.hotKeys.onKeyPress[dir](store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: dir, pressed: true });
      return;
    }
    if (ev.keyCode === 13) {
      if (state.game.hotKeys.onKeyPress.enter != null) {
        state.game.hotKeys.onKeyPress.enter(store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: 'enter', pressed: true });
      return;
    }
    if (ev.keyCode === 32) {
      if (state.game.hotKeys.onKeyPress.space != null) {
        state.game.hotKeys.onKeyPress.space(store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: 'space', pressed: true });
      return;
    }
    var character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.game.hotKeys.onKeyPress[character] != null) {
        state.game.hotKeys.onKeyPress[character](store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: character, pressed: true });
    }
  };

  document.onkeyup = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.game.hotKeys.onKeyUp[dir] != null) {
        state.game.hotKeys.onKeyUp[dir](store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: dir, pressed: false });
      return;
    }
    if (ev.keyCode === 13) {
      if (state.game.hotKeys.onKeyUp.enter != null) {
        state.game.hotKeys.onKeyUp.enter(store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: 'enter', pressed: false });
      return;
    }
    if (ev.keyCode === 32) {
      if (state.game.hotKeys.onKeyUp.space != null) {
        state.game.hotKeys.onKeyUp.space(store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: 'space', pressed: false });
      return;
    }
    var character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.game.hotKeys.onKeyUp[character] != null) {
        state.game.hotKeys.onKeyUp[character](store);
      }
      dispatch({ type: 'SET_KEY_PRESS', key: character, pressed: false });
    }
  };
};

var getUpDownLeftRight = function getUpDownLeftRight(ev) {
  var keyCode = ev.keyCode;

  if (keyCode === 87 || keyCode === 38 || keyCode === 119) {
    return 'up';
  }

  if (keyCode === 83 || keyCode === 40 || keyCode === 115) {
    return 'down';
  }

  if (keyCode === 65 || keyCode === 37 || keyCode === 97) {
    return 'left';
  }

  if (keyCode === 68 || keyCode === 39 || keyCode === 100) {
    return 'right';
  }
  return null;
};

module.exports = { initKeyboardControlsSystem: initKeyboardControlsSystem };