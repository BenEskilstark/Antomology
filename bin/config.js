'use strict';

var config = {
  msPerTick: 100,

  // grid size
  width: 50,
  height: 50,

  // TODO: grid-to-canvas conversion for pan/zoom

  // canvas size
  canvasWidth: 800,
  canvasHeight: 800,

  // colony entrance location id:
  colonyEntrance: 0,

  foodSpawnRate: 0.02, // ~once per 5 seconds
  foodSpawnCalories: 1000,

  // ant-specific values
  maxSelectableAnts: 3,
  antPickupEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'DEAD_ANT'],
  antBlockingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA'],
  antEatEntities: ['FOOD', 'DEAD_ANT'],
  antStartingCalories: 4000,
  antCaloriesPerEat: 1000,
  antStarvationWarningThreshold: 0.3,

  // life-cycle related
  antMaxAge: 10000,
  eggHatchAge: 300,
  larvaStartingCalories: 2000,
  larvaEndCalories: 3000,
  pupaHatchAge: 200
};

module.exports = { config: config };