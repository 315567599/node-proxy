'use strict';

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var promiseRequest = require('./requestPromise');


function debug() {
    _logger2.default.info.apply(_logger2.default, ['shihui_node_proxy'].concat(Array.prototype.slice.call(arguments)));
}