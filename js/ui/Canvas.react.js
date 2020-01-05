// @flow

const React = require('react');

type Props = {
  width: number,
  height: number,
};

function Canvas(props: Props): React.Node {
  return (
    <canvas
        id="canvas" className="gameCanvas"
        width={props.width} height={props.height}
      />
  );
}

module.exports = Canvas;
