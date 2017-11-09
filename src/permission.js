import promiseRequest from './requestPromise';
import logger from './logger';

function debug() {
    logger.info.apply(logger, ['shihui_node_proxy', ...arguments]);
}

export function getTest() {
   const options = {
      hostname:'test.v2.goods.17shihui.com',
       port:80,
       path: '/api/app/goods/index?cityid=1&mid=1084581',
       method: 'GET',
       headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
       }
   };
   return promiseRequest(options);
}
