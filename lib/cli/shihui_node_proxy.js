'use strict';

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _redisCache = require('../redisCache');

var _redisCache2 = _interopRequireDefault(_redisCache);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _permission = require('../permission');

var _memoryCache = require('../memoryCache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var proxy = require('express-http-proxy');
var cookieParser = require('cookie-parser');
var https = require('https');
var http = require('http');
var proxyConfg = require('../proxy.json');


function debug() {
    _logger2.default.info.apply(_logger2.default, ['shihui_node_proxy'].concat(Array.prototype.slice.call(arguments)));
}

//redis cache
//const redisCtx = {
//    host:config.redisHost,
//    port:config.reidsPort
//};

//const redis = new redisCache(redisCtx);
//redis.put("jiangchao", "hello,jiangchao").then(()=>{return debug('->redis put')});
//redis.put("jiangchao1", "hello,jiangchao1").then(()=>{ return debug('redis put')});

//memory cache
//const cache = new memoryCache();
//cache.put('jiangchao', 'value');
//debug('result', cache.get('jiangchao'));

var sockets = {};
var app = express();
var server = http.createServer(app).listen(_config2.default.listenPort);
debug('-> running on process ' + process.pid + '...');
server.on('connection', initConnections);

function initConnections(socket) {
    var socketId = socket.remoteAddress + ':' + socket.remotePort;
    sockets[socketId] = socket;
    socket.on('close', function () {
        delete sockets[socketId];
    });
}

function destroyAliveConnections() {
    for (var socketId in sockets) {
        try {
            sockets[socketId].destroy();
        } catch (e) {/* */}
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
app.use('/health', function (req, res) {
    debug(req.host, '->request: /health');
    res.send('good');
});

app.use('/connections', function (req, res) {
    debug(req.host, '->request: /connections');
    var conn = '';
    Object.keys(sockets).forEach(function (key) {
        conn += key;
    });
    res.send(conn);
});

app.use('/cache', function (req, res) {
    debug(req.host, '->request: /cache');
    var cacheObj = _memoryCache.cache.all();
    var str = '';
    Object.keys(cacheObj).forEach(function (key) {
        str += key;
    });
    res.send(str);
});

app.use('/promise', function (req, res) {
    (0, _permission.getTest)().then(function (data) {
        debug('->request /promise');
        res.json(data);
    });
});
// proxy
app.use(cookieParser());
var options = {
    proxyReqOptDecorator: function proxyReqOptDecorator(proxyReq, originalReq) {
        return new Promise(function (resolve, reject) {
            proxyReq.headers['X-MATRIX-UID'] = 1000;
            if (originalReq.cookies.token) {
                proxyReq.headers['token'] = originalReq.cookies.token;
            }
            resolve(proxyReq);
        });
    },
    limit: '500mb',
    timeout: 5000, // 5 seconds
    userResDecorator: function userResDecorator(proxyRes, proxyResData, userReq, userRes) {
        return new Promise(function (resolve, reject) {
            resolve(proxyResData);
            debug('->proxy', userReq.path);
        });
    }
};
var env = process.env.NODE_ENV !== 'production' ? 'test_host' : 'host';
for (var key in proxyConfg) {
    app.use("/p/" + key, proxy(proxyConfg[key][env], options));
}