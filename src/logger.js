/**
 *  author:jiangchao@17shihui.com
 *  date: 2017-11-8
 */
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import config from  './config';
import _ from 'lodash';

const logger = new winston.Logger();
const transports = Object.assign({}, logger.transports);
var logsFolder = config.logsFolder;

if (logsFolder) {
    if (!path.isAbsolute(logsFolder)) {
        logsFolder = path.resolve(process.cwd(), logsFolder);
    }
    try {
        fs.mkdirSync(logsFolder);
    } catch (e) { /* */ }
}
transports['daily-log'] = new (DailyRotateFile)({
        filename: path.join(logsFolder, config.logFile),
        dataPattern:'-yyyy-MM-dd.log',
        maxsize: 1024 *1024 *10 //10M
});
transports['console'] = new (winston.transports.Console)({
  colorize:true,
    name:'console'
});
logger.configure({
    transports:_.values(transports)
});

export default logger;

