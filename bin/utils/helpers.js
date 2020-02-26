"use strict";

var floor = Math.floor,
    sqrt = Math.sqrt,
    random = Math.random,
    round = Math.round;


var rand = function rand() {
  return random();
};

// return an integer between min and max, inclusive
var randomIn = function randomIn(min, max) {
  return floor(min + rand() * (max - min + 1));
};

var shamefulGaussian = function shamefulGaussian() {
  return (rand() + rand() + rand() + rand() + rand() + rand() - 3) / 3;
};
var normalIn = function normalIn(min, max) {
  var gaussian = shamefulGaussian();
  return floor(min + gaussian * (max - min + 1));
};

var oneOf = function oneOf(options) {
  if (options.length === 0) return null;
  return options[floor(rand() * options.length)];
};

// delete an item from the given array using filter. Optionally provide a comparison
// function, or else do a shallow comparison
var deleteFromArray = function deleteFromArray(arr, item, compareFn) {
  var fn = compareFn == null ? function (i) {
    return i === item;
  } : compareFn;
  return arr.filter(function (i) {
    return i !== item;
  });
};

var clamp = function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
};

function insertInGrid(grid, position, item) {
  var x = position.x,
      y = position.y;

  if (grid[x] == null) {
    grid[x] = [];
  }
  if (grid[x][y] == null) {
    grid[x][y] = [];
  }
  grid[x][y].push(item);
}

function lookupInGrid(grid, position) {
  var x = position.x,
      y = position.y;

  if (grid[x] == null) {
    grid[x] = [];
  }
  if (grid[x][y] == null) {
    grid[x][y] = [];
  }
  return grid[x][y];
}

function deleteFromGrid(grid, position, item) {
  var x = position.x,
      y = position.y;

  grid[x][y] = grid[x][y].filter(function (i) {
    return i != item;
  });
}

function getInnerLocation(loc) {
  if (loc == null) return null;
  return {
    position: {
      x: loc.position.x + 1,
      y: loc.position.y + 1
    },
    width: loc.width - 2,
    height: loc.height - 2
  };
}

function isInRadius(center, radius, pos) {
  var diff = {
    x: Math.abs(center.x - pos.x),
    y: Math.abs(center.y - pos.y)
  };
  var sumSqr = diff.x * diff.x + diff.y * diff.y;
  // less than and not less than or equal to match FoW calculation
  return sqrt(sumSqr) < radius;
}

module.exports = {
  randomIn: randomIn,
  normalIn: normalIn,
  oneOf: oneOf,
  deleteFromArray: deleteFromArray,
  insertInGrid: insertInGrid,
  lookupInGrid: lookupInGrid,
  deleteFromGrid: deleteFromGrid,
  clamp: clamp,
  getInnerLocation: getInnerLocation,
  isInRadius: isInRadius
};