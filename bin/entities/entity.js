'use strict';

var nextID = 0;

var makeEntity = function makeEntity(type, width, height, position, toLift, theta, spriteSet) {
  return {
    id: nextID++,
    type: type,
    width: width,
    height: height,
    age: 0,

    position: position,
    prevPosition: { x: 0, y: 0 },

    theta: theta || 0,
    thetaSpeed: 0,

    visible: false,
    lastSeenPos: null,

    toLift: toLift || 1,
    heldBy: [],
    lifted: false,

    frameIndex: 0,
    maxFrames: spriteSet && spriteSet.length ? spriteSet.length : 1,
    spriteSet: spriteSet
  };
};

module.exports = { makeEntity: makeEntity };