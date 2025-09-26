'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _expoRouter = require('expo-router');

var _constantsTheme = require('../constants/theme');

var _constantsIcons = require('../constants/icons');

var _constantsIcons2 = _interopRequireDefault(_constantsIcons);

var CustomHeader = function CustomHeader(_ref) {
  var _ref$title = _ref.title;
  var title = _ref$title === undefined ? '' : _ref$title;
  var _ref$showBackButton = _ref.showBackButton;
  var showBackButton = _ref$showBackButton === undefined ? true : _ref$showBackButton;
  var rightIcon = _ref.rightIcon;
  var onRightPress = _ref.onRightPress;

  var router = (0, _expoRouter.useRouter)();

  return _react2['default'].createElement(
    _reactNative.View,
    { style: styles.container },
    showBackButton ? _react2['default'].createElement(
      _reactNative.TouchableOpacity,
      { style: styles.iconButton, onPress: function () {
          return router.back();
        } },
      _react2['default'].createElement(_reactNative.Image, { source: _constantsIcons2['default'].left, style: styles.icon, resizeMode: 'contain' })
    ) : _react2['default'].createElement(_reactNative.View, { style: styles.placeholder }),
    _react2['default'].createElement(
      _reactNative.Text,
      { numberOfLines: 1, style: styles.title },
      title
    ),
    rightIcon ? _react2['default'].createElement(
      _reactNative.TouchableOpacity,
      { style: styles.iconButton, onPress: onRightPress },
      _react2['default'].createElement(_reactNative.Image, { source: rightIcon, style: styles.icon, resizeMode: 'contain' })
    ) : _react2['default'].createElement(_reactNative.View, { style: styles.placeholder })
  );
};

var styles = _reactNative.StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: _constantsTheme.COLORS.white,
    paddingHorizontal: _constantsTheme.SIZES.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: _constantsTheme.COLORS.border
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: _constantsTheme.COLORS.textPrimary,
    fontFamily: _constantsTheme.FONT.bold,
    fontSize: _constantsTheme.SIZES.h3
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: _constantsTheme.COLORS.gray100
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: _constantsTheme.COLORS.textPrimary
  },
  placeholder: {
    width: 40,
    height: 40
  }
});

exports['default'] = CustomHeader;
module.exports = exports['default'];