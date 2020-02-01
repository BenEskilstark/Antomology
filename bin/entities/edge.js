'use strict';

var nextEdgeID = 0;

var createEdge = function createEdge(start) {
  return {
    id: nextEdgeID++,
    start: start,
    end: null,
    condition: null
  };
};

module.exports = { createEdge: createEdge };