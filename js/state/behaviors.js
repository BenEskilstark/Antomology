// @flow

const {getEntitiesByType} = require('../selectors/selectors');

import type {GameState} from '../types';

// const behaviors = (game: GameState): Object => {
//   DO_ACTION: {
//     MOVE: [
//       {name: 'LOCATION', options: getEntitiesByType(game, ['LOCATION'])},
//       {name: 'RANDOM'},
//     ],
//     PICKUP: [
//       {name: 'FOOD'}, {name: 'DIRT'}, {name: 'MARKED'},
//       {name: 'EGG'}, {name: 'LARVA'}, {name: 'PUPA'},
//     ],
//     PUTDOWN: [{name: 'HELD'}],
//     IDLE: [],
//     EAT: [{name: 'FOOD'}],
//     FEED: [{name: 'EGG'}, {name: 'LARVA'}, {name: 'PUPA'}, {name: 'ANT'}, {name: 'QUEEN'}],
//     LAY: ['EGG'],
//   },
//   CONDITION: {
//     LOCATION: {
//       comparators: ['EQUALS'],
//       object: getEntitiesByType(game, ['LOCATION']),
//     },
//     RANDOM: {
//       comparators: ['EQUALS', 'LESS_THAN', 'GREATER_THAN'],
//       object: ['NUMBER'],
//     },
//     CALORIES: {
//       comparators: ['EQUALS', 'LESS_THAN', 'GREATER_THAN'],
//       object: ['NUMBER'],
//     },
//     AGE: {
//       comparators: ['EQUALS', 'LESS_THAN', 'GREATER_THAN'],
//       object: ['NUMBER'],
//     },
//     HOLDING: {
//       comparators: ['EQUALS'],
//       object: ['ANYTHING', 'NOTHING', 'DIRT', 'FOOD', 'EGG', 'LARVA', 'PUPA'],
//     },
//     NEIGHBORING: {
//       comparators: ['EQUALS'],
//       object: ['MARKED', 'DIRT', 'FOOD'],
//     },
//     BLOCKED: {
//       comparators: ['EQUALS'],
//       object: true,
//     }
//   },
//   DO_WHILE: {
//
//   },
//   SWITCH_TASK: {
//
//   },
// };
//
// module.exports = {behaviors};
