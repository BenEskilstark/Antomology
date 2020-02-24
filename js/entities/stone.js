// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Stone, Vector} from '../types';

const makeStone = (position: Vector, size?: Size): Stone => {
  return makeEntity('STONE', size || 1, size || 1, position);
};

const makeStuckStone = (position: Vector, size?: Size): Stone => {
  return makeEntity('STUCK_STONE', size || 1, size || 1, position);
};

module.exports = {makeStone, makeStuckStone};
