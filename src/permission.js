const promiseRequest = require('./requestPromise');
import logger from './logger';

function debug() {
    logger.info.apply(logger, ['shihui_node_proxy', ...arguments]);
}


