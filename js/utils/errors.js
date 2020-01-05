// @flow

const invariant = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
}

module.exports = {invariant};
