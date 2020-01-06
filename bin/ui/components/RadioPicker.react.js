'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('React');

// props:
// options: Array<string>
// selected: string
// onChange: (option) => void

var RadioPicker = function (_React$Component) {
  _inherits(RadioPicker, _React$Component);

  function RadioPicker() {
    _classCallCheck(this, RadioPicker);

    return _possibleConstructorReturn(this, (RadioPicker.__proto__ || Object.getPrototypeOf(RadioPicker)).apply(this, arguments));
  }

  _createClass(RadioPicker, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var optionToggles = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var option = _step.value;

          optionToggles.push(React.createElement(
            'div',
            {
              key: 'radioOption_' + option,
              className: 'radioOption'
            },
            option,
            React.createElement('input', { type: 'radio',
              className: 'radioCheckbox',
              value: option,
              checked: option === _this2.props.selected,
              onChange: function onChange() {
                return _this2.props.onChange(option);
              }
            })
          ));
        };

        for (var _iterator = this.props.options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return React.createElement(
        'div',
        null,
        optionToggles
      );
    }
  }]);

  return RadioPicker;
}(React.Component);

module.exports = RadioPicker;