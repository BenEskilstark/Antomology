// @flow

import type {Radians, Vector, Size, Entity, EntityType} from '../types';


// HACK: adding to window so that importing a level can update it
window.nextID = 0;

const makeEntity = (
  type: EntityType,
  width: number,
  height: number,
  position: Vector,
  toLift?: number,
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

    theta: theta || 0,
    thetaSpeed: 0,

    visible: false,
    lastSeenPos: null,

    toLift: toLift || 1,
    heldBy: [],
    lifted: false,

    frameIndex: 0,
    maxFrames: spriteSet && spriteSet.length ? spriteSet.length : 1,
    spriteSet,
  };
};

module.exports = {makeEntity};
