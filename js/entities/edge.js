// @flow

import type {Edge, EdgeID, EntityID} from '../types';

let nextEdgeID = 0;

const createEdge = (start: EntityID): Edge => {
  return {
    id: nextEdgeID++,
    start,
    end: null,
    condition: null,
  };
};

module.exports = {createEdge};
