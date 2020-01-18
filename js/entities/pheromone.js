// @flow

const {makeEntity} = require('./entity');
const {config} = require('../config');

import type {Size, Radian, Entity, Pheromone, Vector} from '../types';

const makePheromone = (
  position: Vector,
  theta: Radian,
  category: number,
  quantity: ?number,
): Pheromone => {
  const amount = quantity != null ? quantity : config.pheromoneStartingQuantity;
  return {
    ...makeEntity('PHEROMONE', 1, 1, position),
    theta,
    category,
    quantity: amount,
  };
};

module.exports = {makePheromone};
