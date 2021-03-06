'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTest = getTest;
exports.getUserInfoByToken = getUserInfoByToken;

var _requestPromise = require('./requestPromise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _memoryCache = require('./memoryCache');

var _redisCache = require('./redisCache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function debug() {
    _logger2.default.info.apply(_logger2.default, ['permission'].concat(Array.prototype.slice.call(arguments)));
}

function getTest() {
    //redisObj.put("jiangchao", "hello,jiangchao").then(()=>{return debug('->redis put')});
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

function getUserInfoByToken(token) {
    if (!token) {
        return Promise.resolve(null);
    }
    var key = 'auth_' + token;
    return _redisCache.redisObj.get(key);
}