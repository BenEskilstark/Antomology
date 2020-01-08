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
  antBlockingEntities: ['DIRT', 'FOOD'],
  antEatEntities: ['FOOD', 'DEAD_ANT'],
  antStartingCalories: 2000,
  antCaloriesPerEat: 1000,
  antStarvationWarningThreshold: 0.3

};

module.exports = { config: config };