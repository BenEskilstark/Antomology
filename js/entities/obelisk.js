// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Obelisk, Vector} from '../types';

const makeObelisk = (position: Vector, width: number, height: number): Obelisk => {
  return {
    ...makeEntity('OBELISK', width, height, position),
    theta: 0,
  };
};

module.exports = {makeObelisk};
