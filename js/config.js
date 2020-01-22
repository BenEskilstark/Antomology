// @flow

const config = {
  msPerTick: 100,

  // screen sizes in grid cells and in pixels:
  // grid size
  width: 50,
  height: 50,
  // canvas size
  canvasWidth: 800,
  canvasHeight: 800,

  // hardcoded location ids:
  clickedPosition: -1,
  colonyEntrance: 0,

  // fog-of-war
  entitiesInFog: ['DIRT', 'FOOD', 'DEAD_ANT', 'SKY'],
  antVisionRadius: 7,

  // food
  foodSpawnRate: 0.02, // ~once per 5 seconds
  foodSpawnCalories : 1000,

  // selection
  maxSelectableAnts: 3,
  selectableEntities: ['ANT', 'EGG', 'LARVA', 'PUPA'],

  // ant-specific values
  antPickupEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'DEAD_ANT'],
  antBlockingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA'],
  antEatEntities: ['FOOD', 'DEAD_ANT'],
  antStartingCalories: 4000,
  antCaloriesPerEat: 1000,
  antMaxCalories: 6000,
  antStarvationWarningThreshold: 0.3,

  // life-cycle related
  antMaxAge: 10000,
  eggHatchAge: 300,
  larvaStartingCalories: 3000,
  larvaEndCalories: 4000,
  pupaHatchAge: 200,

  // pheromones
  pheromoneStartingQuantity: 600,
  pheromoneMaxQuantity: 1200,
};

module.exports = {config};
