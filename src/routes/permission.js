//权限相关路由
const express = require('express');
import {getTest} from '../permission';
import logger from  '../logger';

function debug() {
    logger.info.apply(logger, ['routerPermission', ...arguments]);
}

const rp = express.Router();

rp.get('/permission', (req,res) => {
    getTest().then((data)=>{
        debug('->request /permission');
        res.json(data);
    });
});

export {rp};

