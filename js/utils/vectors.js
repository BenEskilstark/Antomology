// @flow

const {cos, sin} = Math;

export type Vector = {
  x: number,
  y: number,
};
export type Radians = number;
export type Degrees = number;

const add = (...vectors: Array<Vector>): Vector => {
  const resultVec = {x: 0, y: 0};
  for (const v of vectors) {
    resultVec.x += v.x;
    resultVec.y += v.y;
  }
  return resultVec;
}

const equals = (a: Vector, b: Vector): boolean => {
  return a.x == b.x && a.y == b.y;
};

// NOTE: see vectorTheta note if subtracting vectors to find the angle between them
const subtract = (...vectors: Array<Vector>): Vector => {
  const resultVec = {...vectors[0]};
  for (let i = 1; i < vectors.length; i++) {
    resultVec.x -= vectors[i].x;
    resultVec.y -= vectors[i].y;
  }
  return resultVec;
}

const makeVector = (theta: Radians, magnitude: number): Vector => {
  const x = magnitude * cos(theta);
  const y = magnitude * sin(theta);
  return {x, y};
}

const distance = (vector: Vector): number => {
  const {x, y} = vector;
  return Math.sqrt(x * x + y * y);
}

// what is the angle of this vector
// NOTE: that when subtracting two vectors in order to compute the theta
// between them, the target should be the first argument
const vectorTheta = (vector: Vector): Radians => {
  // shift domain from [-Math.PI, Math.PI] to [0, 2 * Math.PI]
  return (2*Math.PI + Math.atan2(vector.y, vector.x)) % (2*Math.PI);
}

const multiply = (...vectors: Array<Vector>): Vector => {
  const resultVec = {x: 1, y: 1};
  for (let i = 0; i < vectors.length; i++) {
    resultVec.x *= vectors[i].x;
    resultVec.y *= vectors[i].y;
  }
  return resultVec;
};

const floor = (vector: Vector): Vector => {
  return {
    x: Math.floor(vector.x),
    y: Math.floor(vector.y),
  };
};

const round = (vector: Vector): Vector => {
  return {
    x: Math.round(vector.x),
    y: Math.round(vector.y),
  };
};

const ceil = (vector: Vector): Vector => {
  return {
    x: Math.ceil(vector.x),
    y: Math.ceil(vector.y),
  };
};

module.exports = {
  add,
  subtract,
  equals,
  makeVector,
  distance,
  vectorTheta,
  multiply,
  floor,
  round,
  ceil,
};
