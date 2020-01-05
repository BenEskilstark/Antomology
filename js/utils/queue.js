// @flow

const queueAdd = <T>(queue: Array<T>, item: T, maxLength: number): ?T => {
  queue.push(item);
  if (queue.length > maxLength) {
    return queue.shift();
  }
  return null;
}

module.exports = {queueAdd};
