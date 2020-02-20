'use strict';

var _require = require('../config'),
    config = _require.config;

var initKeyboardControlsSystem = function initKeyboardControlsSystem(store) {
  var dispatch = store.dispatch;

  // document.onkeydown = (ev) => {
  // }

  document.onkeypress = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var dir = getUpDownLeftRight(ev);
    if (dir == null) return;

    dispatch({ type: 'SET_KEY_PRESS', dir: dir, pressed: true });
  };

  document.onkeyup = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var dir = getUpDownLeftRight(ev);
    if (dir == null) return;

    dispatch({ type: 'SET_KEY_PRESS', dir: dir, pressed: false });
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