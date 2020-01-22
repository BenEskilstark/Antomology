// @flow

import type {Radians, Vector, Size, Entity, EntityType} from '../types';

let nextID = 0;

const makeEntity = (
  type: EntityType,
  width: number,
  height: number,
  position: Vector,
  velocity?: Vector,
  theta?: Radians,

  spriteSet?: Array<any>,
): Entity => {
  return {
    id: nextID++,
    type,
    width,
    height,
    age: 0,

    position,
    prevPosition: {x: 0, y: 0},
    velocity: velocity || {x: 0, y: 0},
    accel: {x: 0, y: 0},

    theta: theta || 0,
    thetaSpeed: 0,

    visible: false,
    lastSeenPos: null,

    frameIndex: 0,
    maxFrames: spriteSet && spriteSet.length ? spriteSet.length : 1,
    spriteSet,
  };
};

module.exports = {makeEntity};
