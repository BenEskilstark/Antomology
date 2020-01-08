'use strict';

var React = require('React');

/**
 * Props:
 *  checked: boolean
 *  onChange: (value: boolean) => void
 */
function Checkbox(props) {
  var checked = props.checked,
      _onChange = props.onChange;

  return React.createElement('input', {
    type: 'checkbox',
    checked: checked,
    onChange: function onChange() {
      _onChange(!checked);
    }
  });
}

module.exports = Checkbox;