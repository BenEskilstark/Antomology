// @flow

import type {Vector, Entity} from '../types';
const {makeEntity} = require('./entity');
const {createRandomMoveInLocationTask} = require('../state/graphTasks');

const makeLocation = (
  name: string,
  width: number,
  height: number,
  position: Vector,
): Entity => {
  const loc = {
    ...makeEntity(
      'LOCATION',
      width,
      height,
      position,
    ),
    name,
    incomingEdges: [],
    outgoingEdges: [],
    task: null,
    visible: true,
  };
  loc.task = createRandomMoveInLocationTask(loc.id);
  return loc;
};

module.exports = {makeLocation};
