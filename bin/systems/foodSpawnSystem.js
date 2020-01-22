'use strict';

// no flow checking cuz it's annoying

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../entities/food'),
    makeFood = _require2.makeFood;

var _require3 = require('../utils/helpers'),
    randomIn = _require3.randomIn;

var _require4 = require('../selectors/selectors'),
    fastCollidesWith = _require4.fastCollidesWith,
    getEntitiesByType = _require4.getEntitiesByType;

var initFoodSpawnSystem = function initFoodSpawnSystem(store) {

  var time = -1;
  store.subscribe(function () {
    var state = store.getState();
    if (state.game == null) return;
    // only check on a new tick
    if (state.game.time == time) {
      return;
    }
    time = state.game.time;

    if (Math.random() < config.foodSpawnRate) {
      var x = randomIn(0, state.game.worldWidth - 1);
      var y = randomIn(0, state.game.worldHeight - 1);
      if (fastCollidesWith(state.game, { position: { x: x, y: y } }).filter(function (e) {
        return config.antBlockingEntities.includes(e.type);
      }).length == 0) {
        var food = makeFood({ x: x, y: y }, config.foodSpawnCalories, 'Crumb');
        store.dispatch({ type: 'CREATE_ENTITY', entity: food });
      }
    }
  });
};

module.exports = { initFoodSpawnSystem: initFoodSpawnSystem };