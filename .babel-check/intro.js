'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _reactNativePaper = require('react-native-paper');

var InstructionScreen = function InstructionScreen() {
  var _useWindowDimensions = (0, _reactNative.useWindowDimensions)();

  var width = _useWindowDimensions.width;

  var slides = [{
    title: 'Welcome to ekazi!',
    text: 'Order Various Services conveniently at your comfort ',
    image: require('../assets/Couch.png')
  }, {
    title: 'Track Services',
    text: 'Be able to track your Services in real time',
    image: require('../assets/track.png')
  }];

  var renderItem = function renderItem(_ref) {
    var item = _ref.item;
    return _react2['default'].createElement(
      _reactNative.View,
      { style: styles.slide },
      _react2['default'].createElement(_reactNative.Image, { source: item.image, style: styles.image }),
      _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.title },
        item.title
      ),
      _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.text },
        item.text
      )
    );
  };

  return _react2['default'].createElement(
    _reactNative.View,
    { style: styles.container },
    _react2['default'].createElement(
      _reactNative.View,
      { style: { width: width } },
      _react2['default'].createElement(_reactNative.FlatList, {
        data: slides,
        keyExtractor: function (_, idx) {
          return String(idx);
        },
        renderItem: function (_ref2) {
          var item = _ref2.item;
          return _react2['default'].createElement(
            _reactNative.View,
            { style: [styles.slide, { width: width }] },
            _react2['default'].createElement(_reactNative.Image, { source: item.image, style: styles.image }),
            _react2['default'].createElement(
              _reactNative.Text,
              { style: styles.title },
              item.title
            ),
            _react2['default'].createElement(
              _reactNative.Text,
              { style: styles.text },
              item.text
            )
          );
        },
        horizontal: true,
        pagingEnabled: true,
        showsHorizontalScrollIndicator: false,
        getItemLayout: function (_, index) {
          return { length: width, offset: width * index, index: index };
        },
        snapToInterval: width,
        decelerationRate: 'fast'
      })
    ),
    _react2['default'].createElement(
      _reactNativePaper.Button,
      {
        mode: 'contained',
        style: styles.button,
        onPress: function () {/* TODO: Navigate to login */}
      },
      'Next'
    )
  );
};

var styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20
  },
  button: {
    marginTop: 20,
    paddingTop: 10,
    width: 200,
    paddingVertical: 10,
    borderRadius: 20
  }
});

exports['default'] = InstructionScreen;
module.exports = exports['default'];
/* Minimal maintained pager replacement using FlatList */