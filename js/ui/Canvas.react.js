// @flow

const React = require('react');

type Props = {
  width: number,
  height: number,
};

function Canvas(props: Props): React.Node {
  // canvasWrapper allows for checking dynamic width/height
  return (
    <div id="canvasWrapper"
      style={{
        width: '66%', height: '100%',
        display: 'inline-block',
        float: 'left',
      }}
    >
      <canvas
        id="canvas" style={{backgroundColor: 'white'}}
        width={props.width} height={props.height}
      />
    </div>
  );
}

module.exports = Canvas;
