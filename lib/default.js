'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
    cacheTTL: 5000
};