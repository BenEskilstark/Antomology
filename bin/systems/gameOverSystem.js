'use strict';

var _require = require('../config'),
    config = _require.config;

var initGameOverSystem = function initGameOverSystem(store) {
  store.subscribe(function () {
    var state = store.getState();
    if (state.game == null || !state.game.gameOver) return;
    var _state$game = state.game,
        gameOver = _state$game.gameOver,
        level = _state$game.level;

    var dispatch = store.dispatch;
    dispatch({ type: 'SET_GAME_OVER', gameOver: null });
    dispatch({ type: 'STOP_TICK' });
    if (gameOver === 'win') {
      if (level < 2) {
        store.dispatch({ type: 'SET_MODAL', modal: {
            title: 'You Win!',
            text: 'You successfully brought the obelisk to the target',
            buttons: [{ label: 'Continue', onClick: function onClick() {
                dispatch({ type: 'DISMISS_MODAL' });
                dispatch({ type: 'START', level: level + 1 });
              } }]
          } });
      } else {
        dispatch({ type: 'SET_MODAL', modal: {
            title: 'You Beat All the Levels!',
            text: 'Thank you for playing.',
            buttons: [{ label: 'Back to menu', onClick: function onClick() {
                dispatch({ type: 'DISMISS_MODAL' });
                dispatch({ type: 'RETURN_TO_MENU' });
              } }]
          } });
      }
    } else if (gameOver === 'lose') {
      dispatch({ type: 'SET_MODAL', modal: {
          title: 'The Queen is Dead!',
          text: 'Ant colonies won\'t survive without their queen.',
          buttons: [{ label: 'Back to menu', onClick: function onClick() {
              dispatch({ type: 'DISMISS_MODAL' });
              dispatch({ type: 'RETURN_TO_MENU' });
            } }, { label: 'Restart level', onClick: function onClick() {
              dispatch({ type: 'DISMISS_MODAL' });
              dispatch({ type: 'START', level: level });
              dispatch({ type: 'START_TICK', updateSim: true });
            } }]
        } });
    }
  });
};

module.exports = { initGameOverSystem: initGameOverSystem };