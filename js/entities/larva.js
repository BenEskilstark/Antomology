// @flow

const {makeEntity} = require('./entity');
const {config} = require('../config');

import type {Vector, Size, Entity, Larva, AntSubType} from '../types';

const makeLarva = (position: Vector, subType: AntSubType): Larva => {
  return {
    ...makeEntity('LARVA', 1, 1, position),
    calories: config.larvaStartCalories,
    alive: true,
    subType,
  };
};

module.exports = {makeLarva};
