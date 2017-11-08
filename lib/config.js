'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 *  author: jiangchao@17shihui.com
 *  date: 2017-11-8
 */
var logsFolder = function () {
    var folder = './logs/';
    if (typeof process !== 'undefined' && process.env.TESTING === '1') {
        folder = './test_logs/';
    }
    return folder;
}();

var _ref = function () {
    var verbose = process.env.VERBOSE ? true : false;
    return { verbose: verbose, level: verbose ? 'verbose' : undefined };
}(),
    verbose = _ref.verbose,
    level = _ref.level;

exports.default = {
    DefaultURI: 'https://pmp.17shihui.com',
    logsFolder: logsFolder,
    verbose: verbose,
    level: level,
    logFile: 'stat',
    checkLogin: true,
    checkPermission: true,
    redis: '127.0.0.1:6379',
    cacheTTL: 5000
};