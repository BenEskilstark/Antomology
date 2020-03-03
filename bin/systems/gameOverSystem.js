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
    if (gameOver === 'win') {
      if (level < 2) {
        console.log("pop modal");
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
            buttons: [{ label: 'Backt to menu', onClick: function onClick() {
                dispatch({ type: 'DISMISS_MODAL' });
                dispatch({ type: 'RETURN_TO_MENU' });
              } }]
          } });
      }
    } else if (gameOver === 'lose') {}
  });
};

module.exports = { initGameOverSystem: initGameOverSystem };