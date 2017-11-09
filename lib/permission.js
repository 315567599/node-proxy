'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTest = getTest;

var _requestPromise = require('./requestPromise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _memoryCache = require('./memoryCache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function debug() {
    _logger2.default.info.apply(_logger2.default, ['permission'].concat(Array.prototype.slice.call(arguments)));
}

function getTest() {
    _memoryCache.cache.put('jiangchao', 'test value');
    var options = {
        hostname: 'test.v2.goods.17shihui.com',
        port: 80,
        path: '/api/app/goods/index?cityid=1&mid=1084581',
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return (0, _requestPromise2.default)(options);
}