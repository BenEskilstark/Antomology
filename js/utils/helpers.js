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

const oneOf = (options) => options[floor(rand() * options.length)];

module.exports = {
  randomIn,
  normalIn,
  oneOf,
};
