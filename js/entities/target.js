// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Vector} from '../types';

const makeTarget = (position: Vector): Entity => {
  return makeEntity('TARGET', 3, 3, position);
}

module.exports = {makeTarget};
