'use strict';

var bugs = ['APHID', 'BEETLE', 'SPIDER', 'WORM', 'CENTIPEDE', 'LADYBUG', 'DRAGONFLY'];
var flyingBugs = ['LADYBUG', 'DRAGONFLY'];
var nonFlyingBugs = ['APHID', 'BEETLE', 'SPIDER', 'WORM', 'CENTIPEDE'];

var config = {
  msPerTick: 150,

  // screen sizes in grid cells and in pixels:
  // grid size
  width: 60,
  height: 40,
  // canvas size
  canvasWidth: 1200,
  canvasHeight: 800,

  // hardcoded location ids:
  clickedPosition: -1,
  colonyEntrance: 0, // DEPRECATED

  // bug values
  bugs: bugs,
  wormBlockingEntities: ['STONE', 'STUCK_STONE', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'OBELISK'].concat(bugs),
  centipedeBlockingEntities: ['DIRT', 'STONE', 'STUCK_STONE', 'OBELISK'],

  // fog-of-war
  entitiesInFog: ['DIRT', 'FOOD', 'BACKGROUND', 'STONE', 'STUCK_STONE', 'GRASS'].concat(bugs),
  antVisionRadius: 40,
  immobileEntities: [// simpler to compute visibility if we know they never move
  'BACKGROUND', 'GRASS', 'STUCK_STONE', 'TARGET'],

  // gravity
  supportingBackgroundTypes: ['DIRT'],
  supportingForegroundTypes: ['GRASS'], // like background
  fallingEntities: [// fall until above blocker
  'EGG', 'ANT', 'DIRT', 'LARVA', 'FOOD', 'STONE', 'OBELISK'].concat(nonFlyingBugs),
  supportedEntities: [// also stopped by supporting background behind
  'ANT', 'DIRT', 'WORM', 'CENTIPEDE'],
  climbingEntities: ['ANT'], // must be subset of supportedEntities
  stopFallingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'STONE', 'ANT', 'OBELISK', 'STUCK_STONE'],

  // food
  foodSpawnRate: 0.002, // ~once per 50 seconds
  foodSpawnCalories: 1000,

  // selection
  maxSelectableAnts: 100000,
  selectableEntities: ['ANT', 'EGG', 'LARVA', 'PUPA', 'LOCATION'],

  // ant-specific values
  antPickupEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'OBELISK'],
  antBlockingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'STONE', 'STUCK_STONE'],
  antEatEntities: ['FOOD'],
  antStartingCalories: 4000,
  antCaloriesPerEat: 1000,
  antMaxCalories: 6000,
  antStarvationWarningThreshold: 0.3,
  antOldAgeDeathWarningThreshold: 0.8,
  antStartingHP: 10,
  attackableEntities: [].concat(bugs),

  // life-cycle related
  eggLayingCooldown: 50,
  antMaxAge: 10000,
  eggHatchAge: 300,
  larvaStartingCalories: 3000,
  larvaEndCalories: 4000,
  pupaHatchAge: 200,

  // pheromones
  pheromoneStartingQuantity: 1000,
  pheromoneMaxQuantity: 1800,
  pheromoneReinforcement: 10
};

module.exports = { config: config };