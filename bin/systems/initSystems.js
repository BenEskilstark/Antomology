'use strict';

// a system for starting up the other systems

var _require = require('./renderSystem'),
    initRenderSystem = _require.initRenderSystem;

var _require2 = require('./foodSpawnSystem'),
    initFoodSpawnSystem = _require2.initFoodSpawnSystem;

var _require3 = require('./mouseControlsSystem'),
    initMouseControlsSystem = _require3.initMouseControlsSystem;

var _require4 = require('./keyboardControlsSystem'),
    initKeyboardControlsSystem = _require4.initKeyboardControlsSystem;

var _require5 = require('./gameOverSystem'),
    initGameOverSystem = _require5.initGameOverSystem;

var initSystems = function initSystems(store) {
  var gameMode = store.getState().mode;
  var prevGameState = store.getState().game;
  store.subscribe(function () {
    var nextGameMode = store.getState().mode;
    var game = store.getState().game;
    // game systems
    if (prevGameState == null && game != null && nextGameMode === 'GAME') {
      initRenderSystem(store);
      initMouseControlsSystem(store);
      initKeyboardControlsSystem(store);
      initGameOverSystem(store);
      // initFoodSpawnSystem(store);
      // const audio = document.getElementById('clayMusic1');
      // audio.play();

      // editor systems
    } else if (nextGameMode === 'EDITOR' && prevGameState == null && game != null) {
      initRenderSystem(store);
      initMouseControlsSystem(store);
      initKeyboardControlsSystem(store);
    }

    gameMode = nextGameMode;
    prevGameState = game;
  });
};

module.exports = { initSystems: initSystems };