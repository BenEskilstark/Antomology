// @flow

import type {Vector, Entity} from '../types';
const {makeEntity} = require('./entity');
const {
  createRandomMoveInLocationTask,
  createFindPheromoneTask,
  createHighLevelIdleTask,
} = require('../state/graphTasks');

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
  // loc.task = createFindPheromoneTask();
  // TODO update name on location name update
  loc.task = {...createHighLevelIdleTask(), name: loc.name};;
  // loc.task = {...createRandomMoveInLocationTask(loc.id), name: loc.name};
  return loc;
};

module.exports = {makeLocation};
