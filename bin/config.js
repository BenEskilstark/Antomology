'use strict';

var config = {
  msPerTick: 150,

  // screen sizes in grid cells and in pixels:
  // grid size
  width: 50,
  height: 50,
  // canvas size
  canvasWidth: 800,
  canvasHeight: 800,

  // hardcoded location ids:
  clickedPosition: -1,
  colonyEntrance: 0, // DEPRECATED

  // fog-of-war
  entitiesInFog: ['DIRT', 'FOOD', 'DEAD_ANT', 'BACKGROUND', 'STONE', 'STUCK_STONE', 'GRASS', 'TARGET'],
  antVisionRadius: 7,

  // gravity
  supportingBackgroundTypes: ['DIRT'],
  supportingForegroundTypes: ['GRASS'], // like background
  // fall until above blocker
  fallingEntities: ['EGG', 'ANT', 'DIRT', 'LARVA', 'FOOD', 'STONE', 'OBELISK'],
  supportedEntities: ['ANT', 'DIRT'], // also stopped by supporting background behind
  climbingEntities: ['ANT'], // must be subset of supportedEntities
  stopFallingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'STONE', 'ANT', 'OBELISK', 'STUCK_STONE'],

  // food
  foodSpawnRate: 0.002, // ~once per 50 seconds
  foodSpawnCalories: 1000,

  // selection
  maxSelectableAnts: 100000,
  selectableEntities: ['ANT', 'EGG', 'LARVA', 'PUPA', 'OBELISK', 'LOCATION'],

  // ant-specific values
  antPickupEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'DEAD_ANT', 'OBELISK'],
  antBlockingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'STONE', 'STUCK_STONE'],
  antEatEntities: ['FOOD', 'DEAD_ANT'],
  antStartingCalories: 4000,
  antCaloriesPerEat: 1000,
  antMaxCalories: 6000,
  antStarvationWarningThreshold: 0.3,
  antOldAgeDeathWarningThreshold: 0.8,

  // life-cycle related
  eggLayingCooldown: 50,
  antMaxAge: 10000,
  eggHatchAge: 300,
  larvaStartingCalories: 3000,
  larvaEndCalories: 4000,
  pupaHatchAge: 200,

  // pheromones
  pheromoneStartingQuantity: 100,
  pheromoneMaxQuantity: 1800,
  pheromoneReinforcement: 10
};

module.exports = { config: config };