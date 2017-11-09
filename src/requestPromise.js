/**
 *  request promise wrapper , so then.then.then...
 */
//const request = require('request');
const http = require('http');
import logger from './logger';

function debug() {
    logger.info.apply(logger, ['requestPromise', ...arguments]);
}

export default function promiseRequest(options) {
    return new Promise((resolve, reject) =>{
        const req = http.request(options, (res) => {
            let data = Object.create(null);
            res.on('data',(chunk)=>{
                data = JSON.parse(chunk);
            });
            res.on('end', ()=>{
               debug('->request', options);
                resolve(data);
            });
        });

        req.on('error', (err)=>{
            debug('-> error', err)
            reject(err)
        });

        req.end();
    });
}