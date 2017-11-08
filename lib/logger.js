'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _winstonDailyRotateFile = require('winston-daily-rotate-file');

var _winstonDailyRotateFile2 = _interopRequireDefault(_winstonDailyRotateFile);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  author:jiangchao@17shihui.com
 *  date: 2017-11-8
 */
var logger = new _winston2.default.Logger();
var transports = Object.assign({}, logger.transports);
var logsFolder = _config2.default.logsFolder;

if (logsFolder) {
    if (!_path2.default.isAbsolute(logsFolder)) {
        logsFolder = _path2.default.resolve(process.cwd(), logsFolder);
    }
    try {
        _fs2.default.mkdirSync(logsFolder);
    } catch (e) {/* */}
}
transports['daily-log'] = new _winstonDailyRotateFile2.default({
    filename: _path2.default.join(logsFolder, _config2.default.logFile),
    dataPattern: '-yyyy-MM-dd.log',
    maxsize: 1024 * 1024 * 10 //10M
});
transports['console'] = new _winston2.default.transports.Console({
    colorize: true,
    name: 'console'
});
logger.configure({
    transports: _lodash2.default.values(transports)
});

exports.default = logger;