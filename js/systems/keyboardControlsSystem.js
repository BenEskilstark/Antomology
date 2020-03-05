
const {config} = require('../config');
const {createLayEggTask} = require('../state/tasks');
const {getQueen} = require('../selectors/selectors');

let done = false;
const initKeyboardControlsSystem = (store) => {
  if (done) return;
  done = true;
  const {dispatch} = store;

  //////////////////////////////////////////////////////////////////////////////
  // Register hotkeys
  //////////////////////////////////////////////////////////////////////////////
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



  //////////////////////////////////////////////////////////////////////////////
  // keypress event handling
  //////////////////////////////////////////////////////////////////////////////
  document.onkeydown = (ev) => {
    const state = store.getState();
    if (state.game == null) return;
    const dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.game.hotKeys.onKeyDown[dir] != null) {
        state.game.hotKeys.onKeyDown[dir](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: dir, pressed: true});
      return;
    }
    if (ev.keyCode === 13) {
      if (state.game.hotKeys.onKeyDown.enter != null) {
        state.game.hotKeys.onKeyDown.enter(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'enter', pressed: true});
      return;
    }
    if (ev.keyCode === 32) {
      if (state.game.hotKeys.onKeyDown.space != null) {
        state.game.hotKeys.onKeyDown.space(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'space', pressed: true});
      return;
    }
    const character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.game.hotKeys.onKeyDown[character] != null) {
        state.game.hotKeys.onKeyDown[character](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: character, pressed: true});
    }
  }

  document.onkeypress = (ev) => {
    const state = store.getState();
    if (state.game == null) return;
    const dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.game.hotKeys.onKeyPress[dir] != null) {
        state.game.hotKeys.onKeyPress[dir](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: dir, pressed: true});
      return;
    }
    if (ev.keyCode === 13) {
      if (state.game.hotKeys.onKeyPress.enter != null) {
        state.game.hotKeys.onKeyPress.enter(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'enter', pressed: true});
      return;
    }
    if (ev.keyCode === 32) {
      if (state.game.hotKeys.onKeyPress.space != null) {
        state.game.hotKeys.onKeyPress.space(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'space', pressed: true});
      return;
    }
    const character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.game.hotKeys.onKeyPress[character] != null) {
        state.game.hotKeys.onKeyPress[character](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: character, pressed: true});
    }
  }

  document.onkeyup = (ev) => {
    const state = store.getState();
    if (state.game == null) return;
    const dir = getUpDownLeftRight(ev);
    if (dir != null) {
      if (state.game.hotKeys.onKeyUp[dir] != null) {
        state.game.hotKeys.onKeyUp[dir](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: dir, pressed: false});
      return;
    }
    if (ev.keyCode === 13) {
      if (state.game.hotKeys.onKeyUp.enter != null) {
        state.game.hotKeys.onKeyUp.enter(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'enter', pressed: false});
      return;
    }
    if (ev.keyCode === 32) {
      if (state.game.hotKeys.onKeyUp.space != null) {
        state.game.hotKeys.onKeyUp.space(store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: 'space', pressed: false});
      return;
    }
    const character = String.fromCharCode(ev.keyCode).toUpperCase();
    if (character != null) {
      if (state.game.hotKeys.onKeyUp[character] != null) {
        state.game.hotKeys.onKeyUp[character](store);
      }
      dispatch({type: 'SET_KEY_PRESS', key: character, pressed: false});
    }
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
