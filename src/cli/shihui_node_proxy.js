
const express = require('express');
const proxy = require('express-http-proxy');
const cookieParser = require('cookie-parser');
const https = require('https');
const http = require('http');
const proxyConfg = require('../proxy.json');
import logger from  '../logger';
import redisCache from '../redisCache';
import config from '../config';
import {getTest} from '../permission';
import {cache} from '../memoryCache';
import {rp} from '../routes/permission';

function debug() {
    logger.info.apply(logger, ['shihui_node_proxy', ...arguments]);
}

//redis cache
//const redisCtx = {
//    host:config.redisHost,
//    port:config.reidsPort
//};

//const redis = new redisCache(redisCtx);
//redis.put("jiangchao", "hello,jiangchao").then(()=>{return debug('->redis put')});
//redis.put("jiangchao1", "hello,jiangchao1").then(()=>{ return debug('redis put')});

const sockets = {};
const app = express();
app.use(cookieParser());
const server = http.createServer(app).listen(config.listenPort);
debug(`-> running on process ${process.pid}...` );
server.on('connection', initConnections);

function initConnections(socket) {
    const socketId = socket.remoteAddress + ':' + socket.remotePort;
    sockets[socketId] = socket;
    socket.on('close', () => {
        delete sockets[socketId];
    });
}

function destroyAliveConnections() {
    for (const socketId in sockets) {
        try {
            sockets[socketId].destroy();
        } catch (e) { /* */ }
    }
}

function handleShutdown() {
   debug('-> process shutdown');
   destroyAliveConnections();
   server.close();
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

//sys
app.use('/health', (req, res)=> {
    debug(req.host, '->request: /health');
    res.send('good')
});

app.use('/connections', (req, res)=> {
    debug(req.host, '->request: /connections');
    let conn = '';
    Object.keys(sockets).forEach((key) => {
       conn += key;
    });
    res.send(conn);
});

app.use('/cache', (req, res) => {
    debug(req.host, '->request: /cache');
    let cacheObj = cache.all();
    let str = '';
    Object.keys(cacheObj).forEach((key) => {
        str += key;
    });
    res.send(str);
});

app.use('/promise', (req, res)=>{
   getTest().then((data)=>{
       debug('->request /promise');
       res.json(data);
   });
});

//other router
app.use(rp);

// proxy
var options = {
    proxyReqOptDecorator: function(proxyReq, originalReq) {
        return new Promise((resolve, reject)=>{
            proxyReq.headers['X-MATRIX-UID'] = 1000;
            if (originalReq.cookies.token) {
                proxyReq.headers['token'] = originalReq.cookies.token;
            }
            resolve(proxyReq);
        });
    },
    limit: '500mb',
    timeout: 5000, // 5 seconds
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
        return new Promise((resolve,reject)=>{
            resolve(proxyResData);
            debug('->proxy', userReq.path);
        });
    }
};
var env = process.env.NODE_ENV !== 'production' ? 'test_host' : 'host';
for (var key in proxyConfg) {
    app.use("/p/" + key, proxy(proxyConfg[key][env], options));
}
