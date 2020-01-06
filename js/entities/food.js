// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Food, Vector} from '../types';

const makeFood = (
  position: Vector,
  calories: number,
  name: string,
  size?: Size,
): Food => {
  return {
    ...makeEntity('FOOD', size || 1, size || 1, position),
    name,
    calories,
  };
};

module.exports = {makeFood};
