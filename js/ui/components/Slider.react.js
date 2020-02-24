
const React = require('react');
const {useState, useMemo, useEffect} = React;

/**
 *  props:
 *  min, max: number,
 *  value: ?number (min if null),
 *  onChange: (number) => void,
 *  step: ?number (1 if null),
 *  label: ?string,
 */
function Slider(props) {
  const label = (
    <div style={{display: 'inline-block'}}>
      {props.label}
    </div>
  );
  const value = props.value != null ? props.value : props.min;
  return (
    <div>
      {props.label != null ? label : null}
      <input type="range"
        min={props.min} max={props.max}
        value={value}
        onChange={(ev) => props.onChange(parseInt(ev.target.value))}
        step={props.step != null ? props.step : 1}
      />
      <div style={{display: 'inline-block'}}>
        {value}
      </div>
    </div>
  );
}

module.exports = Slider;
