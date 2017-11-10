const express = require('express');
const proxy = require('express-http-proxy');
const cookieParser = require('cookie-parser');
const https = require('https');
const http = require('http');
const proxyConfg = require('../proxy.json');
import logger from  '../logger';
import config from '../config';
import {getTest} from '../permission';
import {cache} from '../memoryCache';
import {rp} from '../routes/permission';
import {getUserInfoByToken} from '../permission';

//display debug info , and write file
function debug() {
    logger.info.apply(logger, ['shihui_node_proxy', ...arguments]);
}

//express start
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
//hook exception
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);


//sys route
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

// proxy, http headers with common info
var options = {
    proxyReqOptDecorator: function(proxyReq, originalReq) {
        let token = originalReq.cookies.token;
        debug('-> proxy with token', token );
       getUserInfoByToken(token).then((data)=>{
           debug('->proxy with data', data);
           return new Promise((resolve, reject)=>{
               proxyReq.headers['X-MATRIX-UID'] = 1000;
             //  if (data.id) {
             //      proxyReq.headers['X-UID'] = data.id;
             //  }
             //  if (data.user_name) {
             //      proxyReq.headers['X-USERNAME'] = data.user_name;
             //  }
             //  if (data.department) {
             //      proxyReq.headers['X-DEPARTMENT'] = data.department;
             //  }
             //  if (data.channel_id) {
             //      proxyReq.headers['X-CHANNETL_ID'] = data.channel_id;
             //  }
             //  if (data.company_id) {
             //      proxyReq.headers['X-COMPANY_ID'] = data.company_id;
             //  }
             //  if (data.yun_channel_id) {
             //      proxyReq.headers['X-YUN_CHANNEL_ID'] = data.yun_channel_id;
             //  }
               if (originalReq.cookies.token) {
                   proxyReq.headers['token'] = originalReq.cookies.token;
               }
               resolve(proxyReq);
           });
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
