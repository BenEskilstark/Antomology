// @flow

const {makeEntity} = require('./entity');
const {config} = require('../config');

import type {Vector, Size, AntSubType, Entity, Pupa} from '../types';

const makePupa = (position: Vector, subType: AntSubType): Pupa => {
  return {
    ...makeEntity('PUPA', 1, 1, position),
    subType,
    visible: true,
    alive: true,
    hp: config.antStartingHP,
  };
};

module.exports = {makePupa};
