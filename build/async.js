// Generated by CoffeeScript 1.6.2
var ajaxManagers, async, blockDummy, dvl, makeManager, nextGroupId, outstanding, utilModule,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

dvl = require('./core');

utilModule = require('./util');

outstanding = dvl(0).name('outstanding');

ajaxManagers = [];

blockDummy = {};

makeManager = function() {
  var addHoock, getData, initRequestBundle, inputChange, makeRequest, maybeDone, nextQueryId, queries, worker;

  nextQueryId = 0;
  initRequestBundle = [];
  queries = [];
  maybeDone = dvl.group(function(requestBundle) {
    var request, _i, _j, _len, _len1, _ref;

    for (_i = 0, _len = requestBundle.length; _i < _len; _i++) {
      request = requestBundle[_i];
      if (request.status !== 'ready') {
        return;
      }
    }
    for (_j = 0, _len1 = requestBundle.length; _j < _len1; _j++) {
      request = requestBundle[_j];
      request.res.value((_ref = request.resVal) != null ? _ref : null);
      request.status = '';
      request.requestBundle = null;
      delete request.resVal;
    }
  });
  getData = function(request, query, err, resVal) {
    if (!request.requestBundle) {
      throw new Error("getData called outside of a request");
    }
    if (err) {
      request.resVal = null;
      if (request.onError) {
        request.onError(err);
      }
    } else {
      request.resVal = query ? resVal : null;
    }
    request.status = 'ready';
    delete request.curAjax;
    delete request.processResponce;
    maybeDone(request.requestBundle);
  };
  makeRequest = function(request) {
    var oldAjax, oldProcessResponce, processResponce, requestCount, responceProcessed, _query;

    if (__indexOf.call(request.requestBundle, request) < 0) {
      throw new Error("invalid request");
    }
    requestCount = request.requestCount;
    _query = request.query.value();
    oldAjax = request.curAjax;
    oldProcessResponce = request.processResponce;
    if (_query != null) {
      if (request.invalidOnLoad.value()) {
        request.res.value(null);
      }
      responceProcessed = false;
      processResponce = function(err, data) {
        if (this === blockDummy) {
          responceProcessed = true;
        }
        if (responceProcessed) {
          return;
        }
        responceProcessed = true;
        requestCount.value(requestCount.value() - 1);
        getData(request, _query, err, data);
      };
      requestCount.value(requestCount.value() + 1);
      request.processResponce = processResponce;
      request.curAjax = request.requester(_query, processResponce);
    } else {
      getData(request, _query, null, null);
    }
    if (oldProcessResponce) {
      requestCount.value(requestCount.value() - 1);
      oldProcessResponce.call(blockDummy);
      if (oldAjax != null) {
        if (typeof oldAjax.abort === "function") {
          oldAjax.abort();
        }
      }
    }
  };
  inputChange = function() {
    var makeRequestLater, newRequestBundle, q, _i, _j, _len, _len1;

    makeRequestLater = [];
    newRequestBundle = [];
    for (_i = 0, _len = queries.length; _i < _len; _i++) {
      q = queries[_i];
      if (!q.query.hasChanged()) {
        continue;
      }
      if (q.status === 'virgin') {
        if (q.query.value()) {
          initRequestBundle.push(q);
          q.status = 'requesting';
          q.requestBundle = initRequestBundle;
          makeRequestLater.push(q);
        } else {
          q.status = '';
        }
      } else {
        q.status = 'requesting';
        if (q.requestBundle) {
          delete q.resVal;
          makeRequestLater.push(q);
        } else {
          newRequestBundle.push(q);
          q.requestBundle = newRequestBundle;
          makeRequestLater.push(q);
        }
      }
    }
    for (_j = 0, _len1 = makeRequestLater.length; _j < _len1; _j++) {
      q = makeRequestLater[_j];
      makeRequest(q);
    }
  };
  worker = null;
  addHoock = function(query, ret, requestCount) {
    if (worker) {
      worker.addChange(ret, requestCount);
      worker.addListen(query);
    } else {
      worker = dvl.register({
        listen: [query],
        change: [ret, requestCount],
        fn: inputChange
      });
    }
  };
  return function(query, invalidOnLoad, onError, requester, requestCount) {
    var q, res;

    nextQueryId++;
    res = dvl();
    q = {
      id: nextQueryId,
      query: query,
      res: res,
      status: 'virgin',
      requester: requester,
      onError: onError,
      invalidOnLoad: invalidOnLoad,
      requestBundle: null,
      curAjax: null,
      requestCount: requestCount
    };
    queries.push(q);
    addHoock(query, res, requestCount);
    return res;
  };
};

async = function(_arg) {
  var groupId, invalidOnLoad, onError, query, requestCount, requester;

  query = _arg.query, invalidOnLoad = _arg.invalidOnLoad, onError = _arg.onError, groupId = _arg.groupId, requester = _arg.requester, requestCount = _arg.requestCount;
  if (!query) {
    throw new Error('it does not make sense to not have a query');
  }
  if (!requester) {
    throw new Error('it does not make sense to not have a requester');
  }
  if (typeof requester !== 'function') {
    throw new Error('requester must be a function');
  }
  query = dvl.wrap(query);
  invalidOnLoad = dvl.wrap(invalidOnLoad || false);
  requestCount || (requestCount = outstanding);
  requestCount = dvl.wrapVar(requestCount);
  if (groupId == null) {
    groupId = async.getGroupId();
  }
  ajaxManagers[groupId] || (ajaxManagers[groupId] = makeManager());
  return ajaxManagers[groupId](query, invalidOnLoad, onError, requester, requestCount);
};

async.outstanding = outstanding;

nextGroupId = 0;

async.getGroupId = function() {
  var id;

  id = nextGroupId;
  nextGroupId++;
  return id;
};

async.requester = {
  ajax: function(query, complete) {
    var abort, ajax, data;

    data = query.dataFn ? query.dataFn(query.data) : query.data;
    ajax = jQuery.ajax({
      url: query.url,
      data: data,
      type: query.method || 'GET',
      dataType: query.dataType || 'json',
      contentType: data != null ? query.contentType || 'application/json' : void 0,
      processData: query.processData || false,
      success: function(resVal) {
        if (query.fn) {
          resVal = query.fn(resVal, query);
        }
        ajax = null;
        complete(null, resVal);
      },
      error: function(xhr, textStatus) {
        ajax = null;
        complete(xhr.responseText || textStatus, null);
      }
    });
    abort = function() {
      if (ajax) {
        ajax.abort();
        ajax = null;
      }
    };
    return {
      abort: abort
    };
  },
  cacheWrap: function(_arg) {
    var cache, count, keyFn, max, requester, timeout, trim, _ref;

    _ref = _arg != null ? _arg : {}, requester = _ref.requester, max = _ref.max, timeout = _ref.timeout, keyFn = _ref.keyFn;
    if (!requester) {
      throw new Error('it does not make sense to not have a requester');
    }
    if (typeof requester !== 'function') {
      throw new Error('requester must be a function');
    }
    max = dvl.wrap(max || 100);
    timeout = dvl.wrap(timeout || 30 * 60 * 1000);
    cache = {};
    count = 0;
    keyFn || (keyFn = function(_arg1) {
      var contentType, data, dataType, method, processData, url;

      url = _arg1.url, data = _arg1.data, method = _arg1.method, dataType = _arg1.dataType, contentType = _arg1.contentType, processData = _arg1.processData;
      return [url, utilModule.strObj(data), method, dataType, contentType, processData].join('@@');
    });
    trim = function() {
      var cutoff, d, m, newCache, oldestQuery, oldestTime, q, tout, _results;

      tout = timeout.value();
      if (tout > 0) {
        cutoff = Date.now() - tout;
        newCache = {};
        for (q in cache) {
          d = cache[q];
          if (cutoff < d.time) {
            newCache[q] = d;
          }
        }
        cache = newCache;
      }
      m = max.value();
      _results = [];
      while (m < count) {
        oldestQuery = null;
        oldestTime = Infinity;
        for (q in cache) {
          d = cache[q];
          if (d.time < oldestTime) {
            oldestTime = d.time;
            oldestQuery = q;
          }
        }
        delete cache[oldestQuery];
        _results.push(count--);
      }
      return _results;
    };
    dvl.register({
      listen: [max, timeout],
      fn: trim
    });
    return {
      clear: function() {
        cache = {};
        count = 0;
      },
      requester: function(query, complete) {
        var abort, added, c, key;

        key = keyFn(query);
        c = cache[key];
        added = false;
        if (!c) {
          cache[key] = c = {
            time: Date.now(),
            waiting: [complete]
          };
          added = true;
          count++;
          trim();
          c.ajax = requester(query, function(err, resVal) {
            var cb, _i, _j, _len, _len1, _ref1, _ref2;

            if (err) {
              if (err === "abort") {
                return;
              }
              c.ajax = null;
              delete cache[key];
              count--;
              _ref1 = c.waiting;
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                cb = _ref1[_i];
                cb(err, null);
              }
              delete c.waiting;
              return;
            }
            c.ajax = null;
            c.resVal = resVal;
            _ref2 = c.waiting;
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              cb = _ref2[_j];
              cb(null, resVal);
            }
            delete c.waiting;
          });
        }
        if (c.resVal) {
          complete(null, c.resVal);
          abort = function() {};
        } else {
          if (!added) {
            c.waiting.push(complete);
          }
          abort = function() {
            if (!c.waiting) {
              return;
            }
            c.waiting = c.waiting.filter(function(l) {
              return l !== complete;
            });
            complete('abort', null);
            if (c.waiting.length === 0 && c.ajax) {
              c.ajax.abort();
              c.ajax = null;
              delete cache[key];
              count--;
            }
          };
        }
        return {
          abort: abort
        };
      }
    };
  }
};

module.exports = async;