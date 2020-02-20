
const {config} = require('../config');


const initKeyboardControlsSystem = (store) => {
  const {dispatch} = store;

  // document.onkeydown = (ev) => {
  // }

  document.onkeypress = (ev) => {
    const state = store.getState();
    if (state.game == null) return;
    const dir = getUpDownLeftRight(ev);
    if (dir == null) return;

    dispatch({type: 'SET_KEY_PRESS', dir, pressed: true});
  }

  document.onkeyup = (ev) => {
    const state = store.getState();
    if (state.game == null) return;
    const dir = getUpDownLeftRight(ev);
    if (dir == null) return;

    dispatch({type: 'SET_KEY_PRESS', dir, pressed: false});
  }
}

const getUpDownLeftRight = (ev) => {
  const keyCode = ev.keyCode;

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
}

module.exports = {initKeyboardControlsSystem};
