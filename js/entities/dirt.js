// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Dirt, Vector} from '../types';

const makeDirt = (position: Vector, size?: Size): Dirt => {
  return makeEntity('DIRT', size || 1, size || 1, position);
};

module.exports = {makeDirt};
