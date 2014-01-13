// Generated by CoffeeScript 1.6.2
var DVLCollection, dvl,
  __hasProp = {}.hasOwnProperty,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

dvl = require('./core');

DVLCollection = (function() {
  function DVLCollection(_arg) {
    var data, fn, serialize, that;

    data = _arg.data, serialize = _arg.serialize, fn = _arg.fn;
    this._data = data;
    this._serialize = serialize;
    this._fn = fn;
    this._dvlBlocks = {};
    this._dvlVariables = {};
    this._positions = {};
    that = this;
    dvl.register({
      listen: data,
      fn: function() {
        var _data;

        _data = data.value();
        if (!Array.isArray(_data)) {
          return;
        }
        return setTimeout(function() {
          that._buildBlocks(_data);
          return that._destroyBlocks(_data);
        }, 0);
      }
    });
    data.value(data.value());
  }

  DVLCollection.prototype.toString = function() {
    return '[DVLCollection]';
  };

  DVLCollection.prototype._destroyBlocks = function(_data) {
    var k, _block, _ref, _serializedData;

    _serializedData = _data.map(this._serialize);
    _ref = this._dvlBlocks;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      _block = _ref[k];
      if (__indexOf.call(_serializedData, k) < 0) {
        delete this._dvlBlocks[k];
        _block.discard();
      }
    }
  };

  DVLCollection.prototype._buildBlocks = function(_data) {
    var badSerial, badSerials, k, tempDvlBlocks, tempDvlVariables, that, transitionMap, v, _i, _len;

    that = this;
    transitionMap = {};
    badSerials = [];
    _data.forEach(function(_datum, i) {
      var _badSerializedDatum, _serializedDatum;

      _serializedDatum = that._serialize(_datum);
      if (that._dvlBlocks[_serializedDatum] == null) {
        that._dvlBlocks[_serializedDatum] = dvl.block(function() {
          that._dvlVariables[_serializedDatum] = dvl(_datum);
          that._positions[i] = _serializedDatum;
          return that._fn(that._dvlVariables[_serializedDatum]);
        });
      }
      if (_serializedDatum === that._positions[i]) {
        return;
      }
      badSerials.push(_badSerializedDatum = that._positions[i]);
      return transitionMap[_serializedDatum] = {
        badSerial: _badSerializedDatum,
        datum: _datum,
        index: i
      };
    });
    tempDvlVariables = {};
    tempDvlBlocks = {};
    for (k in transitionMap) {
      v = transitionMap[k];
      tempDvlVariables[k] = this._dvlVariables[v.badSerial];
      tempDvlBlocks[k] = this._dvlBlocks[v.badSerial];
    }
    for (k in transitionMap) {
      v = transitionMap[k];
      this._dvlVariables[k] = tempDvlVariables[k];
      this._dvlBlocks[k] = tempDvlBlocks[k];
      this._dvlVariables[k].value(v.datum);
      this._positions[v.index] = k;
      badSerials.splice(badSerials.indexOf(k), 1);
    }
    for (_i = 0, _len = badSerials.length; _i < _len; _i++) {
      badSerial = badSerials[_i];
      delete this._dvlVariables[badSerial];
      delete this._dvlBlocks[badSerial];
    }
  };

  DVLCollection.factory = function() {
    var data, fn, serialize, _ref;

    switch (arguments.length) {
      case 1:
        _ref = arguments[0], data = _ref.data, serialize = _ref.serialize, fn = _ref.fn;
        break;
      case 2:
        data = arguments[0], fn = arguments[1];
        break;
      default:
        throw "incorect number of arguments";
    }
    if (!dvl.knows(data)) {
      throw new Error('data should be dvl variable');
    }
    if (typeof fn !== 'function') {
      throw new Error('function should be provided');
    }
    if (serialize == null) {
      serialize = function(item) {
        return String(item).toString();
      };
    }
    return new DVLCollection({
      data: data,
      fn: fn,
      serialize: serialize
    });
  };

  return DVLCollection;

})();

module.exports = DVLCollection.factory;
