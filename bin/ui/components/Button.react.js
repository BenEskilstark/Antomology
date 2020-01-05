'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('React');

// props:
// id: ?string
// label: string
// onClick: () => void
// disabled: optional boolean
// hotkey: optional number // ascii code for the key to trigger it

var Button = function (_React$Component) {
  _inherits(Button, _React$Component);

  function Button() {
    _classCallCheck(this, Button);

    return _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).apply(this, arguments));
  }

  _createClass(Button, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.onkeydown = null;
    }
  }, {
    key: 'render',
    value: function render() {
      var props = this.props;

      var id = props.id || props.label;

      if (props.hotkey != null) {
        document.onkeydown = function (ev) {
          if (ev.keyCode === props.hotkey && !props.disabled) {
            props.onClick();
          }
        };
      }

      return React.createElement(
        'button',
        { type: 'button',
          key: id || label,
          className: props.disabled ? 'buttonDisable' : '',
          id: id.toUpperCase() + '_button',
          onClick: props.disabled ? function () {} : props.onClick,
          disabled: props.disabled
        },
        props.label
      );
    }
  }]);

  return Button;
}(React.Component);

module.exports = Button;