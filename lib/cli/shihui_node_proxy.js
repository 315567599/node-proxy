'use strict';

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _permission = require('../permission');

var _memoryCache = require('../memoryCache');

var _permission2 = require('../routes/permission');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var proxy = require('express-http-proxy');
var cookieParser = require('cookie-parser');
var https = require('https');
var http = require('http');
var proxyConfg = require('../proxy.json');


//display debug info , and write file
function debug() {
    _logger2.default.info.apply(_logger2.default, ['shihui_node_proxy'].concat(Array.prototype.slice.call(arguments)));
}

//express start
var sockets = {};
var app = express();
app.use(cookieParser());
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
//hook exception
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

//sys route
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

//other router
app.use(_permission2.rp);

// proxy, http headers with common info
var options = {
    proxyReqOptDecorator: function proxyReqOptDecorator(proxyReq, originalReq) {
        var token = originalReq.cookies.token;
        debug('-> proxy with token', token);
        return new Promise(function (resolve, reject) {
            proxyReq.headers['X-MATRIX-UID'] = 1000;
            if (originalReq.cookies.token) {
                proxyReq.headers['token'] = originalReq.cookies.token;
            }
            (0, _permission.getUserInfoByToken)(token).then(function (data) {
                if (data.id) {
                    proxyReq.headers['X-UID'] = data.id;
                }
                if (data.user_name) {
                    proxyReq.headers['X-USERNAME'] = data.user_name;
                }
                if (data.department) {
                    proxyReq.headers['X-DEPARTMENT'] = data.department;
                }
                if (data.channel_id) {
                    proxyReq.headers['X-CHANNETL_ID'] = data.channel_id;
                }
                if (data.company_id) {
                    proxyReq.headers['X-COMPANY_ID'] = data.company_id;
                }
                if (data.yun_channel_id) {
                    proxyReq.headers['X-YUN_CHANNEL_ID'] = data.yun_channel_id;
                }

                resolve(proxyReq);
            });
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