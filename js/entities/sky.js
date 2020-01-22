// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Sky, Vector} from '../types';

const makeSky = (position: Vector, size?: Size): Sky => {
  return makeEntity('SKY', size || 1, size || 1, position);
};

module.exports = {makeSky};
