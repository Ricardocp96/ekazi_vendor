'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = Navoptions;

var _templateObject = _taggedTemplateLiteral(['p-1 pl-2 pb-2 pt-1 bg-gray-200 m-2 w-40  rounded-lg'], ['p-1 pl-2 pb-2 pt-1 bg-gray-200 m-2 w-40  rounded-lg']),
    _templateObject2 = _taggedTemplateLiteral(['mt-2 text-lg font-semibold'], ['mt-2 text-lg font-semibold']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _reactNative = require('react-native');

var _twrnc = require("twrnc");

var _twrnc2 = _interopRequireDefault(_twrnc);

// import { Icon } from '@rneui/themed'; // Commented out: unmaintained package

var data = [{
    id: "977",
    title: "Home Services",
    imageUrl: require('../assets/house.png'),
    screen: "Serviceproviders"

}, {
    id: "976",
    title: "Electronics",
    imageUrl: require('../assets/fix.png'),
    screen: "Serviceproviders"
}];

function Navoptions() {

    return React.createElement(_reactNative.FlatList, {
        data: data,
        horizontal: true,
        keyExtractor: function (item) {
            return item.id;
        },
        renderItem: function (_ref) {
            var item = _ref.item;
            return React.createElement(
                _reactNative.TouchableOpacity,
                { style: (0, _twrnc2['default'])(_templateObject) },
                React.createElement(
                    _reactNative.View,
                    null,
                    React.createElement(_reactNative.Image, {
                        style: { width: 80, height: 80, resizeMode: "contain" },
                        source: item.imageUrl

                    }),
                    React.createElement(
                        _reactNative.Text,
                        { style: (0, _twrnc2['default'])(_templateObject2) },
                        item.title
                    )
                )
            );
        }

    });
}

;
module.exports = exports['default'];