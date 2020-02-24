// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Vector} from '../types';

const makeGrass = (position: Vector): Entity => {
  return makeEntity('GRASS', 1, 1, position);
}

module.exports = {makeGrass}
