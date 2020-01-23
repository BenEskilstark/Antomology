// @flow

const {makeEntity} = require('./entity');

import type {Size, Entity, Background, Vector} from '../types';

const makeBackground = (position: Vector, subType: string, size?: Size): Background => {
  return {
    ...makeEntity('BACKGROUND', size || 1, size || 1, position),
    subType,
  };
};

module.exports = {makeBackground};
