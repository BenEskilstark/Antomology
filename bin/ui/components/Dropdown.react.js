'use strict';

var React = require('React');

/**
 * Props:
 * options: Array<string>
 * displayOptions: ?Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 * noNoneOption: optional boolean // if provided, won't use NONE option
 */
var Dropdown = function Dropdown(props) {
  var options = props.options,
      noNoneOption = props.noNoneOption,
      selected = props.selected,
      _onChange = props.onChange,
      displayOptions = props.displayOptions;

  var optionTags = options.map(function (option, i) {
    var label = displayOptions != null && displayOptions[i] != null ? displayOptions[i] : option;
    return React.createElement(
      'option',
      { key: 'option_' + option, value: option },
      label
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