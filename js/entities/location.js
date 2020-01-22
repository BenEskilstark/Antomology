// @flow

import type {Vector, Entity} from '../types';
const {makeEntity} = require('./entity');

const makeLocation = (
  name: string,
  width: number,
  height: number,
  position: Vector,
): Entity => {
  return {
    ...makeEntity(
      'LOCATION',
      width,
      height,
      position,
    ),
    name,
    visible: true,
  };
};

module.exports = {makeLocation};
