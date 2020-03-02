'use strict';

var _require = require('../config'),
    config = _require.config;

var done = false;
var initKeyboardControlsSystem = function initKeyboardControlsSystem(store) {
  if (done) return;
  done = true;
  var dispatch = store.dispatch;


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
    var character = String.fromCharCode(ev.keyCode);
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
    var character = String.fromCharCode(ev.keyCode);
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