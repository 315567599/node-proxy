'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.redisObj = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_REDIS_TTL = 60 * 2 * 1000; // 2 hour

function debug() {
    _logger2.default.info.apply(_logger2.default, ['redisCache'].concat(Array.prototype.slice.call(arguments)));
}

var redisCache = function () {
    function redisCache(redisCtx) {
        var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_REDIS_TTL;

        _classCallCheck(this, redisCache);

        this.client = _redis2.default.createClient(redisCtx);
        this.p = Promise.resolve();
        this.ttl = ttl;
    }

    _createClass(redisCache, [{
        key: 'get',
        value: function get(key) {
            var _this = this;

            debug('get', key);
            this.p = this.p.then(function () {
                return new Promise(function (resolve) {
                    _this.client.get(key, function (err, res) {
                        debug('-> get', key, res);
                        if (!res) {
                            return resolve(null);
                        }
                        resolve(JSON.parse(res));
                    });
                });
            });
            return this.p;
        }
    }, {
        key: 'put',
        value: function put(key, value) {
            var _this2 = this;

            var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.ttl;

            value = JSON.stringify(value);
            debug('put', key, value, ttl);
            if (ttl === 0) {
                return this.p;
            }
            if (ttl < 0 || isNaN(ttl)) {
                ttl = DEFAULT_REDIS_TTL;
            }
            this.p = this.p.then(function () {
                return new Promise(function (resolve) {
                    if (ttl === Infinity) {
                        _this2.client.set(key, value, function () {
                            resolve();
                        });
                    } else {
                        _this2.client.psetex(key, ttl, value, function () {
                            resolve();
                        });
                    }
                });
            });
            return this.p;
        }
    }, {
        key: 'del',
        value: function del(key) {
            var _this3 = this;

            debug('del', key);
            this.p = this.p.then(function () {
                return new Promise(function (resolve) {
                    _this3.client.del(key, function () {
                        resolve();
                    });
                });
            });
            return this.p;
        }
    }, {
        key: 'clear',
        value: function clear() {
            var _this4 = this;

            debug('clear');
            this.p = this.p.then(function () {
                return new Promise(function (resolve) {
                    _this4.client.flushdb(function () {
                        resolve();
                    });
                });
            });
            return this.p;
        }
    }]);

    return redisCache;
}();

var redisCtx = {
    host: _config2.default.redisHost,
    port: _config2.default.reidsPort
};
var redisObj = new redisCache(redisCtx);
exports.redisObj = redisObj;