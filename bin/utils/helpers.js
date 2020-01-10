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

module.exports = {
  randomIn: randomIn,
  normalIn: normalIn,
  oneOf: oneOf,
  deleteFromArray: deleteFromArray
};