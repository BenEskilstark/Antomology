// @flow

const {makeEntity} = require('./entity');

import type {Size, Radian, Entity, Pheromone, Vector} from '../types';

const makePheromone = (
  position: Vector,
  theta: Radian,
  category: number,
  quantity: number,
): Pheromone => {
  return {
    ...makeEntity('PHEROMONE', 1, 1, position),
    theta,
    category,
    quantity,
  };
};

module.exports = {makePheromone};
