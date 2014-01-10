// Generated by CoffeeScript 1.6.2
var bind, bindSingle, dvl, _ref;

dvl = require('./core');

dvl.data = require('./data');

dvl.async = require('./async');

_ref = require('./bind'), bind = _ref.bind, bindSingle = _ref.bindSingle;

dvl.bind = bind;

dvl.bindSingle = bindSingle;

dvl.html = require('./html');

dvl.svg = require('./svg');

dvl.snap = require('./snap');

dvl.util = require('./util');

module.exports = dvl;
