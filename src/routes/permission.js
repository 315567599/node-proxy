//权限相关路由
const express = require('express');
import {getTest, getUserInfoByToken} from '../permission';
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

/**
 *  根据浏览器cookie中token信息获取用户信息
 */
rp.get('/user', (req,res) => {
    debug('->request /user');
    let token = req.cookies.token || '';
    debug('->token', token);
    getUserInfoByToken(token).then((data)=>{
        let ret = {
            apistatus:1,
            errorMsg: '',
            result:data
        };
        res.json(ret);
    });
});

export {rp};

