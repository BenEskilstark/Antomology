// @flow

const {config} = require('../config');
const {makeEntity} = require('./entity');

import type {Vector, Entity, Bug} from '../types';

const makeAphid = (position: Vector): Bug => {
  return {
    ...makeEntity('APHID', 1, 1, position),
    alive: true,
  };
};

const makeBeetle = (position: Vector, width: number, height: ?number): Bug => {
  return {
    ...makeEntity('BEETLE', width, height != null ? height : width, position),
    alive: true,
  };
};

const makeLadyBug = (position: Vector, width: number, height: ?number): Bug => {
  return {
    ...makeEntity('LADYBUG', width, height != null ? height : width, position),
    alive: true,
  };
};

const makeSpider = (position: Vector, width: number, height: ?number): Bug => {
  return {
    ...makeEntity('SPIDER', width, height != null ? height : width, position),
    alive: true,
  };
};

const makeDragonFly = (position: Vector, width: number): Bug => {
  return {
    ...makeEntity('DRAGONFLY', width, 1, position),
    alive: true,
  };
};


const makeWorm = (position: Vector, segments: Array<Vector>): Bug => {
  return {
    ...makeEntity('WORM', 1, 1, position),
    alive: true,
    segmented: true,
    segments: segments.map(position => ({position})),
  };
};

const makeCentipede = (position: Vector, segments: Array<Vector>): Bug => {
  return {
    ...makeEntity('CENTIPEDE', 1, 1, position),
    alive: true,
    segmented: true,
    segments: segments.map(position => ({position})),
  };
};

module.exports = {
  makeAphid,
  makeBeetle,
  makeLadyBug,
  makeSpider,
  makeDragonFly,
  makeCentipede,
  makeWorm,
};
