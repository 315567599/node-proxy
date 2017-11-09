/**
 *  request promise, wrapper , so then.then.then...
 */
const request = require('request');
import logger from './logger';

function debug() {
    logger.info.apply(logger, ['requestPromise', ...arguments]);
}

export default function promiseRequest(options) {
    return new Promise((resolve, reject) =>{
        const req = request(options, (res) => {
            let data = Object.create(null);
            res.on('data',(chunk)=>{
                data = chunk;
            });
            res.on('end', ()=>{
                debug('->request', options, 'res ', data);
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