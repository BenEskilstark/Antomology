// @flow

const bugs = [
  'APHID', 'BEETLE', 'SPIDER', 'WORM', 'CENTIPEDE', 'LADYBUG', 'DRAGONFLY',
];
const flyingBugs = ['LADYBUG', 'DRAGONFLY'];
const nonFlyingBugs = ['APHID', 'BEETLE', 'SPIDER', 'WORM', 'CENTIPEDE'];

const config = {
  msPerTick: 150,

  // screen sizes in grid cells and in pixels:
  // grid size
  width: 60,
  height: 40,
  // canvas size
  canvasWidth: 1200,
  canvasHeight: 800,

  hoverCardDelay: 2,

  // hardcoded location ids:
  clickedPosition: -1,
  colonyEntrance: 0, // DEPRECATED

  // bug values
  bugs,
  wormBlockingEntities: [
    'STONE', 'STUCK_STONE', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'OBELISK',
    ...bugs,
  ],
  centipedeBlockingEntities: [
    'DIRT', 'STONE', 'STUCK_STONE', 'OBELISK', 'FOOD',
  ],
  dragonFlyBlockingEntities: [
    'DIRT', 'STONE', 'STUCK_STONE', 'OBELISK', 'FOOD',
    ...bugs,
  ],

  wormStartingHP: 100,
  aphidStartingHP: 10,
  centipedeStartingHP: 200,
  beetleStartingHP: 25,

  centipedeDamage: 1,
  aphidDamage: 0,
  beetleDamage: 1,
  wormDamage: 0,

  // fog-of-war
  entitiesInFog: [
    'DIRT', 'FOOD', 'BACKGROUND', 'STONE', 'STUCK_STONE', 'GRASS',
    ...bugs,
  ],
  antVisionRadius: 7,
  immobileEntities: [ // simpler to compute visibility if we know they never move
    'BACKGROUND', 'GRASS', 'STUCK_STONE', 'TARGET',
  ],

  // gravity
  supportingBackgroundTypes: ['DIRT'],
  supportingForegroundTypes: ['GRASS'], // like background
  fallingEntities: [ // fall until above blocker
    'EGG', 'ANT', 'DIRT', 'LARVA', 'FOOD', 'STONE', 'OBELISK',
    ...nonFlyingBugs,
  ],
  supportedEntities: [ // also stopped by supporting background behind
    'ANT', 'DIRT', 'WORM', 'CENTIPEDE',
  ],
  climbingEntities: ['ANT'], // must be subset of supportedEntities
  stopFallingEntities: [
    'DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'STONE', 'ANT', 'OBELISK', 'STUCK_STONE',
  ],

  // food
  foodSpawnRate: 0.002, // ~once per 50 seconds
  foodSpawnCalories : 1000,

  // selection
  maxSelectableAnts: 1,
  selectableEntities: ['ANT', 'EGG', 'LARVA', 'PUPA', 'LOCATION'],

  // ant-specific values
  antPickupEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'OBELISK'],
  antBlockingEntities: ['DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'STONE', 'STUCK_STONE'],
  antEatEntities: ['FOOD'],
  antStartingCalories: 4000,
  antCaloriesPerEat: 1000,
  antMaxCalories: 6000,
  antStarvationWarningThreshold: 0.16666, // 1000 calories
  antOldAgeDeathWarningThreshold: 0.8,
  antStartingHP: 10,
  antDamage: 1,

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
  pheromoneReinforcement: 10,
};

module.exports = {config};
