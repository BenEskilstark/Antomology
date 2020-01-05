'use strict';

var _require = require('../entities/entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../entities/ant'),
    makeAnt = _require2.makeAnt;

var _require3 = require('../entities/dirt'),
    makeDirt = _require3.makeDirt;

var _require4 = require('../entities/location'),
    makeLocation = _require4.makeLocation;

var _require5 = require('../config'),
    config = _require5.config;

var tasks = require('../state/tasks');

var initGameState = function initGameState() {
  var gameState = {
    time: 0,
    tickInterval: null,
    userMode: null,
    mouse: {
      isLeftDown: false,
      isRightDown: false
    },
    selectedEntities: [],
    entities: {},
    ants: [],
    dirt: [],
    locations: [],
    tempLocation: { x: 0, y: 0 },
    tasks: []
  };

  // seed start location
  var colonyEntrance = makeLocation('Colony Entrance', 1, 1, { x: 25, y: 37 });
  gameState.entities[colonyEntrance.id] = colonyEntrance;
  gameState.locations.push(colonyEntrance.id);

  // seed bottom 3/4's with dirt
  for (var x = 0; x < config.width; x++) {
    for (var y = 0; y < config.height; y++) {
      if (y < config.height * 0.75 && Math.random() < 0.99) {
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y) {
          continue;
        }
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y - 1) {
          continue;
        }
        var dirt = makeDirt({ x: x, y: y });
        gameState.entities[dirt.id] = dirt;
        gameState.dirt.push(dirt.id);
      }
    }
  }

  // seed ants
  var ant = makeAnt({ x: 25, y: 38 }, 'QUEEN');
  gameState.entities[ant.id] = ant;
  gameState.ants.push(ant.id);
  var ant1 = makeAnt({ x: 20, y: 38 }, 'WORKER');
  gameState.entities[ant1.id] = ant1;
  gameState.ants.push(ant1.id);
  var ant2 = makeAnt({ x: 30, y: 38 }, 'WORKER');
  gameState.entities[ant2.id] = ant2;
  gameState.ants.push(ant2.id);

  return gameState;
};

module.exports = { initGameState: initGameState };