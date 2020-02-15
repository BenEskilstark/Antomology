'use strict';

// a system for starting up the other systems

var _require = require('./renderSystem'),
    initRenderSystem = _require.initRenderSystem;

var _require2 = require('./foodSpawnSystem'),
    initFoodSpawnSystem = _require2.initFoodSpawnSystem;

var _require3 = require('./mouseControlsSystem'),
    initMouseControlsSystem = _require3.initMouseControlsSystem;

var initSystems = function initSystems(store) {
  var gameMode = store.getState().mode;
  store.subscribe(function () {
    var nextGameMode = store.getState().mode;
    // game systems
    if (gameMode === 'MENU' && nextGameMode === 'GAME') {
      initRenderSystem(store);
      initMouseControlsSystem(store);
      // initFoodSpawnSystem(store);
      // const audio = document.getElementById('clayMusic1');
      // audio.play();

      // editor systems
    } else if (gameMode === 'MENU' && nextGameMode === 'EDITOR') {
      initRenderSystem(store);
      initMouseControlsSystem(store);
    }

    gameMode = nextGameMode;
  });
};

module.exports = { initSystems: initSystems };