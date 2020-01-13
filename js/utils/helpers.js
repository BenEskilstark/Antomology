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

module.exports = {
  randomIn,
  normalIn,
  oneOf,
  deleteFromArray,
  insertInGrid,
  lookupInGrid,
  deleteFromGrid,
};
