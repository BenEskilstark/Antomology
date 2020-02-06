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
  // TODO update name on location name update
  loc.task = {...createRandomMoveInLocationTask(loc.id), name: loc.name};
  return loc;
};

module.exports = {makeLocation};
