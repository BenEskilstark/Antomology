"use strict";

var invariant = function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
};

module.exports = { invariant: invariant };