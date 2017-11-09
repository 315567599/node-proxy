'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.memoryCache = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_CACHE_TTL = 60 * 2 * 1000;

function debug() {
    _logger2.default.info.apply(_logger2.default, ['memoryCache'].concat(Array.prototype.slice.call(arguments)));
}

var memoryCache = exports.memoryCache = function () {
    function memoryCache() {
        _classCallCheck(this, memoryCache);

        this.ttl = DEFAULT_CACHE_TTL;
        this.cache = Object.create(null);
    }

    _createClass(memoryCache, [{
        key: 'get',
        value: function get(key) {
            debug('->get', key);
            var record = this.cache[key];
            if (record == null) {
                return null;
            }

            if (isNaN(record.expire) || record.expire >= Date.now()) {
                return record.value;
            }

            delete this.cache[key];
            return null;
        }
    }, {
        key: 'put',
        value: function put(key, value) {
            var _this = this;

            var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.ttl;

            debug('->put', key, value, ttl);
            if (ttl < 0 || isNaN(ttl)) {
                ttl = NaN;
            }

            var record = {
                value: value,
                expire: ttl + Date.now()
            };

            if (!isNaN(record.expire)) {
                record.timeout = setTimeout(function () {
                    _this.del(key);
                }, ttl);
            }

            this.cache[key] = record;
        }
    }, {
        key: 'del',
        value: function del(key) {
            var record = this.cache[key];
            if (record == null) {
                return;
            }

            if (record.timeout) {
                clearTimeout(record.timeout);
            }
            delete this.cache[key];
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.cache = Object.create(null);
        }
    }]);

    return memoryCache;
}();