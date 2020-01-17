'use strict';

var React = require('React');

/**
 * Props:
 * options: Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 * noNoneOption: optional boolean // if provided, won't use NONE option
 */
var Dropdown = function Dropdown(props) {
  var options = props.options,
      noNoneOption = props.noNoneOption,
      selected = props.selected,
      _onChange = props.onChange;

  var optionTags = options.map(function (option) {
    return React.createElement(
      'option',
      { key: 'option_' + option, value: option, selected: option === selected },
      option
    );
  });
  if (!noNoneOption) {
    optionTags.push(React.createElement(
      'option',
      { key: 'option_null', value: null },
      'NONE'
    ));
  }

  return React.createElement(
    'select',
    {
      onChange: function onChange(ev) {
        var val = ev.target.value;
        if (val != 'NONE') {
          _onChange(val);
        }
      },
      value: selected
    },
    optionTags
  );
};

module.exports = Dropdown;