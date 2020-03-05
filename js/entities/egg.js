// @flow

const {makeEntity} = require('./entity');
const {config} = require('../config');

import type {Vector, Size, Entity, Egg, AntSubType} from '../types';

const makeEgg = (position: Vector, subType: AntSubType): Egg => {
  return {
    ...makeEntity('EGG', 1, 1, position),
    subType,
    visible: true,
    alive: true,
    hp: config.antStartingHP,
  };
};

module.exports = {makeEgg};
