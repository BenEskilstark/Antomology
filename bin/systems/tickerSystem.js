'use strict';

var _require = require('../config'),
    config = _require.config;

var initTickerSystem = function initTickerSystem(store) {
  var time = -1;
  store.subscribe(function () {
    var state = store.getState();
    if (state.game == null) return;
    // only check on a new tick
    if (state.game.time == time) return;
    // important track time this way
    time = state.game.time;
    var level = state.game.level;


    switch (level) {
      case 1:
        level1Ticker(state.game, store.dispatch);
        break;
      case 2:
        level2Ticker(state.game, store.dispatch);
        break;
    }
  });
};

function level1Ticker(game, dispatch) {
  var time = game.time;


  if (time == 5) {
    dispatch({ type: 'SET_TICKER', text: 'WELCOME', maxAge: 500 });
  }
}

function level2Ticker(game, dispatch) {
  var time = game.time;
}

module.exports = { initTickerSystem: initTickerSystem };