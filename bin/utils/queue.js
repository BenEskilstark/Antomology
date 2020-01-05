"use strict";

var queueAdd = function queueAdd(queue, item, maxLength) {
  queue.push(item);
  if (queue.length > maxLength) {
    return queue.shift();
  }
  return null;
};

module.exports = { queueAdd: queueAdd };