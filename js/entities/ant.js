// @flow

const {makeEntity} = require('./entity');

import type {Vector, Size, Entity, Ant, AntSubType} from '../types';

const makeAnt = (position: Vector, subType: AntSubType): Ant => {
  return {
    ...makeEntity('ANT', 1, 1, position),
    subType,
    holding: null,
    hunger: 0,
    caste: null,
    task: null,
    taskIndex: 0,
    blocked: false,
    blockedBy: null,
  };
};

module.exports = {makeAnt};
