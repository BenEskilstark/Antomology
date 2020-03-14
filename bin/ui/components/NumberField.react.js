'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');
var useState = React.useState,
    useMemo = React.useMemo,
    useEffect = React.useEffect;

/**
 * props:
 * value: number
 * onChange: (number) => void,
 * onlyInt: boolean, // only allow ints instead of floats
 * submitOnEnter: boolean, // TODO: not implemented
 * submitOnBlur: boolean,
 */

var NumberField = function NumberField(props) {
  var value = props.value,
      _onChange = props.onChange,
      onlyInt = props.onlyInt,
      submitOnEnter = props.submitOnEnter,
      submitOnBlur = props.submitOnBlur;

  var _useState = useState(value),
      _useState2 = _slicedToArray(_useState, 2),
      stateValue = _useState2[0],
      setValue = _useState2[1];

  useEffect(function () {
    setValue(value);
  }, [value]);

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isFocused = _useState4[0],
      setFocus = _useState4[1];

  useEffect(function () {
    // document.onkeydown = (ev) => {
    //   if (ev.keyCode == 13)  { // Enter
    //     if (isFocused) {
    //       submitValue(onChange, stateValue, onlyInt);
    //     }
    //   }
    // };
  }, [isFocused, stateValue]);

  return React.createElement('input', { type: 'text',
    value: stateValue,
    onFocus: function onFocus() {
      setFocus(true);
    },
    onBlur: function onBlur() {
      setFocus(false);
      if (submitOnBlur) {
        submitValue(_onChange, stateValue, onlyInt);
      }
    },
    onChange: function onChange(ev) {
      var nextVal = ev.target.value;
      setValue(nextVal);
      if (!submitOnEnter && !submitOnBlur) {
        submitValue(_onChange, nextVal, onlyInt);
      }
    }
  });
};

var submitValue = function submitValue(onChange, nextVal, onlyInt) {
  if (nextVal === '') {
    onChange(0);
  } else if (!onlyInt && nextVal[nextVal.length - 1] === '.') {
    onChange(parseFloat(nextVal + '0'));
  } else if (parseFloat(nextVal) === NaN) {
    return; // ignore NaNs
  } else {
    var num = onlyInt ? parseInt(nextVal) : parseFloat(nextVal);
    onChange(num);
  }
};

module.exports = NumberField;