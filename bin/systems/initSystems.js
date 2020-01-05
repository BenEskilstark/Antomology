'use strict';

// a system for starting up the other systems

var _require = require('./renderSystem'),
    initRenderSystem = _require.initRenderSystem;

var _require2 = require('./mouseControlsSystem'),
    initMouseControlsSystem = _require2.initMouseControlsSystem;

var started = false; // TODO there's a better way to handle this...
var initSystems = function initSystems(store) {
  store.subscribe(function () {
    var state = store.getState();
    if (started || !state.game) {
      return;
    }
    started = true;

    initRenderSystem(store);
    initMouseControlsSystem(store);
  });
};

module.exports = { initSystems: initSystems };