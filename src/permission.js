import promiseRequest from './requestPromise';
import logger from './logger';
import {cache} from './memoryCache';
import {redisObj} from './redisCache';

function debug() {
    logger.info.apply(logger, ['permission', ...arguments]);
}

export function getTest() {
    //redisObj.put("jiangchao", "hello,jiangchao").then(()=>{return debug('->redis put')});
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

export function getInfoByToken(token) {
    if(!token) {
       return Promise.resolve(null);
    }
   let key = 'auth_' + token;
   return redisObj.get(key);
}
