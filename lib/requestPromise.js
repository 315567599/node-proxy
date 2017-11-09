'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = promiseRequest;

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  request promise, wrapper , so then.then.then...
 */
//const request = require('request');
var http = require('http');


function debug() {
    _logger2.default.info.apply(_logger2.default, ['requestPromise'].concat(Array.prototype.slice.call(arguments)));
}

function promiseRequest(options) {
    return new Promise(function (resolve, reject) {
        var req = http.request(options, function (res) {
            var data = Object.create(null);
            res.on('data', function (chunk) {
                data = JSON.parse(chunk);
            });
            res.on('end', function () {
                debug('->request', options);
                resolve(data);
            });
        });

        req.on('error', function (err) {
            debug('-> error', err);
            reject(err);
        });

        req.end();
    });
}