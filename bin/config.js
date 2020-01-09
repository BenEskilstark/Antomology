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

  // ant-specific values
  maxSelectableAnts: 4,
  antPickupEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'DEAD_ANT'],
  antBlockingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA'],
  antEatEntities: ['FOOD', 'DEAD_ANT'],
  antStartingCalories: 2000,
  antCaloriesPerEat: 1000,
  antStarvationWarningThreshold: 0.3,

  // life-cycle related
  antMaxAge: 10000,
  eggHatchAge: 20,
  larvaStartCalories: 1000,
  larvaEndCalories: 2000,
  pupaHatchAge: 20
};

module.exports = { config: config };