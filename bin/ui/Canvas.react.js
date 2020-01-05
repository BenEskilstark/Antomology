"use strict";

var React = require('react');

function Canvas(props) {
  return React.createElement("canvas", {
    id: "canvas", className: "gameCanvas",
    width: props.width, height: props.height
  });
}

module.exports = Canvas;