'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../entities/entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../entities/ant'),
    makeAnt = _require2.makeAnt;

var _require3 = require('../entities/dirt'),
    makeDirt = _require3.makeDirt;

var _require4 = require('../entities/obelisk'),
    makeObelisk = _require4.makeObelisk;

var _require5 = require('../entities/stone'),
    makeStone = _require5.makeStone;

var _require6 = require('../entities/background'),
    makeBackground = _require6.makeBackground;

var _require7 = require('../entities/food'),
    makeFood = _require7.makeFood;

var _require8 = require('../entities/location'),
    makeLocation = _require8.makeLocation;

var _require9 = require('../entities/bugs'),
    makeAphid = _require9.makeAphid,
    makeBeetle = _require9.makeBeetle,
    makeLadyBug = _require9.makeLadyBug,
    makeSpider = _require9.makeSpider,
    makeDragonFly = _require9.makeDragonFly,
    makeWorm = _require9.makeWorm,
    makeCentipede = _require9.makeCentipede;

var _require10 = require('../config'),
    config = _require10.config;

var _require11 = require('../utils/helpers'),
    randomIn = _require11.randomIn;

var _require12 = require('../utils/stateHelpers'),
    addEntity = _require12.addEntity,
    insertInGrid = _require12.insertInGrid;

var tasks = require('../state/tasks');
var graphTasks = require('../state/graphTasks');
var level1 = require('../levels/level1');
var level2 = require('../levels/level2');
var level3 = require('../levels/level3');

var initGameState = function initGameState(level) {
  switch (level) {
    case -1:
      return baseState(60, 40);
    case 0:
      return level0();
    case 1:
      return _extends({}, baseState(50, 50), level1.level(), {
        time: 0,
        tickInterval: null,
        level: level
      });
    case 2:
      return _extends({}, baseState(50, 50), level2.level(), {
        time: 0,
        tickInterval: null,
        level: level
      });
    case 3:
      return _extends({}, baseState(50, 50), level3.level(), {
        time: 0,
        tickInterval: null,
        level: level
      });
  }
};

////////////////////////////////////////////////////////////////////////////
// Levels
////////////////////////////////////////////////////////////////////////////

var level0 = function level0() {
  var game = baseState(75, 75);
  // const colonyEntrance = makeLocation('Colony Entrance', 5, 5, {x: 25, y: 30});
  // ...makeLocation('Colony Entrance', 5, 5, {x: 25, y: 29}), id: config.colonyEntrance,
  // };
  // addEntity(game, colonyEntrance);

  // const locationTwo = makeLocation('Location Two', 5, 5, {x: 40, y: 30});
  // addEntity(game, locationTwo);

  // seed background
  for (var x = 0; x < game.worldWidth; x++) {
    for (var y = 0; y < game.worldHeight; y++) {
      if (y >= game.worldHeight * 0.35) {
        addEntity(game, makeBackground({ x: x, y: y }, 'SKY'));
      }
      if (y < game.worldHeight * 0.35) {
        addEntity(game, makeBackground({ x: x, y: y }, 'DIRT'));
      }
    }
  }

  // seed bottom 1/4's with dirt
  for (var _x = 0; _x < game.worldWidth; _x++) {
    for (var _y = 0; _y < game.worldHeight; _y++) {
      if (_y < game.worldHeight * 0.3) {
        if (_x == colonyEntrance.position.x && _y == colonyEntrance.position.y) {
          continue;
        }
        if (_x == colonyEntrance.position.x && _y == colonyEntrance.position.y - 1) {
          continue;
        }
        addEntity(game, makeDirt({ x: _x, y: _y }));
      }
    }
  }

  // seed ants
  // for (let i = 0; i < 1000; i++) {
  //   const position = {
  //     x: randomIn(0, game.worldWidth - 1),
  //     y: randomIn(Math.ceil(game.worldHeight * 0.6), game.worldHeight - 1),
  //   };
  //   const ant = makeAnt(position, 'WORKER');
  //   addEntity(game, ant);
  // }
  addEntity(game, makeAnt({ x: 25, y: 30 }, 'QUEEN'));
  addEntity(game, makeAnt({ x: 18, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 30, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 28, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 32, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 33, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 35, y: 30 }, 'WORKER'));

  // seed bugs
  addEntity(game, makeAphid({ x: 36, y: 40 }));
  addEntity(game, makeBeetle({ x: 40, y: 40 }, 3, 2));
  addEntity(game, makeWorm({ x: 28, y: 20 }, [{ x: 27, y: 20 }, { x: 26, y: 20 }, { x: 26, y: 19 }, { x: 25, y: 19 }, { x: 24, y: 19 }, { x: 24, y: 18 }, { x: 24, y: 17 }, { x: 24, y: 16 }, { x: 24, y: 15 }, { x: 23, y: 15 }]));
  addEntity(game, makeCentipede({ x: 37, y: 23 }, [{ x: 36, y: 23 }, { x: 35, y: 23 }, { x: 34, y: 23 }, { x: 34, y: 24 }, { x: 33, y: 24 }, { x: 32, y: 24 }, { x: 32, y: 25 }]));
  addEntity(game, makeDragonFly({ x: 15, y: 40 }, 6));

  // add obelisk
  addEntity(game, makeObelisk({ x: 20, y: 40 }, 4, 8));

  // add stone
  // addEntity(game, makeStone({x: 35, y: 35}));

  // seed food
  //  for (let i = 0; i < 15; i++) {
  //    const position = {
  //      x: randomIn(0, game.worldWidth - 1),
  //      y: randomIn(Math.ceil(game.worldHeight * 0.6) + 1, game.worldHeight - 1),
  //    };
  //    const food = makeFood(position, 1000, 'Crumb');
  //    addEntity(game, food);
  //  }

  game.level = 0;
  return game;
};

////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////

var baseState = function baseState(worldWidth, worldHeight) {
  var game = {
    time: 0,
    tickInterval: null,
    antMode: 'PICKUP',
    userMode: 'SELECT',
    infoTab: 'Options',

    nextLocationName: 'Give Locations Unique Names',
    prevPheromone: null,
    curEdge: null,

    pheromones: {
      '1': {
        strength: config.pheromoneStartingQuantity,
        condition: null
      },
      '2': {
        strength: config.pheromoneStartingQuantity,
        condition: null
      },
      '3': {
        strength: config.pheromoneStartingQuantity,
        condition: null
      }
    },

    edges: {},

    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: { x: 0, y: 0 },
      curPos: { x: 0, y: 0 },
      curPixel: { x: 0, y: 0 },
      prevPixel: { x: 0, y: 0 }
    },
    hotKeys: {
      onKeyDown: {},
      onKeyPress: {},
      onKeyUp: {},
      keysDown: {}
    },
    ticker: {
      text: '',
      curAge: 0,
      maxAge: 0
    },
    hoverCard: {
      jsx: null,
      mouseStillTime: 0
    },

    worldWidth: worldWidth,
    worldHeight: worldHeight,
    viewPos: { x: 0, y: 0 },

    entities: {},
    selectedEntities: [],
    ANT: [],
    DIRT: [],
    FOOD: [],
    EGG: [],
    LARVA: [],
    PUPA: [],
    LOCATION: [],
    PHEROMONE: [],
    STONE: [],
    OBELISK: [],
    BACKGROUND: [],
    TARGET: [],
    GRASS: [],
    STUCK_STONE: [],
    BEETLE: [],
    LADYBUG: [],
    APHID: [],
    SPIDER: [],
    WORM: [],
    CENTIPEDE: [],
    DRAGONFLY: [],

    tasks: [],
    grid: [],

    gameOver: null,

    fog: true
  };

  // seed start location
  var clickedLocation = _extends({}, makeLocation('Clicked Position', 1, 1, { x: 0, y: 0 }), { id: config.clickedPosition
  });
  addEntity(game, clickedLocation);

  // initial tasks
  game.tasks = [graphTasks.createHighLevelIdleTask(),
  // tasks.createRandomMoveTask(),
  tasks.createLayEggTask(), graphTasks.createFindPheromoneTask(), graphTasks.createFollowTrailTask()];

  return game;
};

module.exports = { initGameState: initGameState };