/**
 *  author: jiangchao@17shihui.com
 *  date: 2017-11-8
 */
const logsFolder = (() => {
        let folder = './logs/';
        if (typeof process !== 'undefined' && process.env.TESTING === '1') {
            folder = './test_logs/'
        }
        return folder;
})();

const { verbose, level } = (() => {
    const verbose = process.env.VERBOSE ? true : false;
    return { verbose, level: verbose ? 'verbose' : undefined }
})();

export default {
    DefaultURI: 'https://pmp.17shihui.com',
    logsFolder,
    verbose,
    level,
    logFile: 'stat',
    checkLogin: true,
    checkPermission: true,
    redis: '127.0.0.1:6379',
    cacheTTL: 5000
}