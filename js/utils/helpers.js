// @flow

const {floor, sqrt, random, round} = Math;

const rand = () => random();

// return an integer between min and max, inclusive
const randomIn = (min, max) => floor(min + rand() * (max - min + 1));

const shamefulGaussian = () => (rand() + rand() + rand() + rand() + rand() + rand() - 3) / 3;
const normalIn = (min, max) => {
  const gaussian = shamefulGaussian();
  return floor(min + gaussian * (max - min + 1));
};

const oneOf = (options) => {
  if (options.length === 0) return null;
  return options[floor(rand() * options.length)];
};

// delete an item from the given array using filter. Optionally provide a comparison
// function, or else do a shallow comparison
const deleteFromArray = (arr, item, compareFn) => {
  let fn = compareFn == null ? (i) => i === item : compareFn;
  return arr.filter(i => i !== item);
}

const clamp = (val, min, max) => {
  return Math.min(Math.max(val, min), max);
}

function insertInGrid(grid, position, item) {
  const {x, y} = position;
  if (grid[x] == null) {
    grid[x] = [];
  }
  if (grid[x][y] == null) {
    grid[x][y] = [];
  }
  grid[x][y].push(item);
}

function lookupInGrid(grid, position) {
  const {x, y} = position;
  if (grid[x] == null) {
    grid[x] = [];
  }
  if (grid[x][y] == null) {
    grid[x][y] = [];
  }
  return grid[x][y];
}

function deleteFromGrid(grid, position, item) {
  const {x, y} = position;
  grid[x][y] = grid[x][y].filter(i => i != item);
}

function getInnerLocation(loc) {
  if (loc == null) return null;
  return {
    position: {
      x: loc.position.x + 1,
      y: loc.position.y + 1,
    },
    width: loc.width - 2,
    height: loc.height - 2,
  };
}

function isInRadius(center, radius, pos) {
  const diff = {
    x: Math.abs(center.x - pos.x),
    y: Math.abs(center.y - pos.y),
  };
  const sumSqr = diff.x * diff.x + diff.y * diff.y;
  // less than and not less than or equal to match FoW calculation
  return sqrt(sumSqr) < radius;
}

module.exports = {
  randomIn,
  normalIn,
  oneOf,
  deleteFromArray,
  insertInGrid,
  lookupInGrid,
  deleteFromGrid,
  clamp,
  getInnerLocation,
  isInRadius,
};
