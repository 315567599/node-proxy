'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.rp = undefined;

var _permission = require('../permission');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//权限相关路由
var express = require('express');


function debug() {
    _logger2.default.info.apply(_logger2.default, ['routerPermission'].concat(Array.prototype.slice.call(arguments)));
}

var rp = express.Router();

rp.get('/permission', function (req, res) {
    (0, _permission.getTest)().then(function (data) {
        debug('->request /permission');
        res.json(data);
    });
});

/**
 *  根据浏览器cookie中token信息获取用户信息
 */
rp.get('/user', function (req, res) {
    debug('->request /user');
    var token = req.cookies.token || '';
    debug('->token', token);
    (0, _permission.getUserInfoByToken)(token).then(function (data) {
        var ret = {
            apistatus: 1,
            errorMsg: '',
            result: data
        };
        res.json(ret);
    });
});

exports.rp = rp;