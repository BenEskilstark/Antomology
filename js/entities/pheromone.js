// @flow

const {makeEntity} = require('./entity');
const {config} = require('../config');

import type {Size, Radian, Entity, Pheromone, Vector, EdgeID} from '../types';

const makePheromone = (
  position: Vector,
  theta: Radian,
  category: number,
  edge: EdgeID,
  quantity: ?number,
): Pheromone => {
  const amount = quantity != null ? quantity : config.pheromoneStartingQuantity;
  return {
    ...makeEntity('PHEROMONE', 1, 1, position),
    theta,
    category,
    quantity: amount,
    edge,
    visible: true,
  };
};

module.exports = {makePheromone};
