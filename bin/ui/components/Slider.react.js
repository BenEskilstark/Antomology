'use strict';

var React = require('react');
var useState = React.useState,
    useMemo = React.useMemo,
    useEffect = React.useEffect;

/**
 *  props:
 *  min, max: number,
 *  value: ?number (min if null),
 *  onChange: (number) => void,
 *  step: ?number (1 if null),
 *  label: ?string,
 */

function Slider(props) {
  var label = React.createElement(
    'div',
    { style: { display: 'inline-block' } },
    props.label
  );
  var value = props.value != null ? props.value : props.min;
  return React.createElement(
    'div',
    null,
    props.label != null ? label : null,
    React.createElement('input', { type: 'range',
      min: props.min, max: props.max,
      value: value,
      onChange: function onChange(ev) {
        return props.onChange(parseInt(ev.target.value));
      },
      step: props.step != null ? props.step : 1
    }),
    React.createElement(
      'div',
      { style: { display: 'inline-block' } },
      value
    )
  );
}

module.exports = Slider;