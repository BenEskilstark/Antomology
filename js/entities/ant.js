// @flow

const {makeEntity} = require('./entity');
const {config} = require('../config');
const {createIdleTask} = require('../state/tasks');

import type {Vector, Size, Entity, Ant, AntSubType} from '../types';

const makeAnt = (position: Vector, subType: AntSubType): Ant => {
  return {
    ...makeEntity('ANT', 1, 1, position),
    subType,
    holding: null,
    calories: config.antStartingCalories,
    caste: null,
    task: createIdleTask(),
    taskIndex: 0,
    blocked: false,
    blockedBy: null,
    alive: true,
  };
};

module.exports = {makeAnt};
