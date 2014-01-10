// Generated by CoffeeScript 1.6.2
var DVLBlock, DVLConst, DVLVar, DVLWorker, PriorityQueue, Set, collect_notify, curBlock, curCollectListener, curNotifyListener, default_compare, dvl, end_notify_collect, fn, getBase, init_notify, k, levelPriorityQueue, nextObjId, nsId, op_to_lift, sortGraph, start_notify_collect, toNotify, uniqById, utilModule, variables, workers, _ref,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ref = require('./basic'), PriorityQueue = _ref.PriorityQueue, Set = _ref.Set;

utilModule = require('./util');

nextObjId = 1;

dvl = function(value) {
  return new DVLVar(value);
};

dvl.version = '1.5.0';

dvl._variables = variables = [];

dvl._workers = workers = [];

curBlock = null;

default_compare = function(a, b) {
  return a === b;
};

DVLConst = (function() {
  function DVLConst(val) {
    this.v = val != null ? val : null;
    this.changed = false;
    return this;
  }

  DVLConst.prototype.toString = function() {
    var tag;

    tag = this.n ? this.n + ':' : '';
    return "[" + this.tag + this.v + "]";
  };

  DVLConst.prototype.value = function(val) {
    if (arguments.length) {
      return this;
    } else {
      return this.v;
    }
  };

  DVLConst.prototype.set = function() {
    return this;
  };

  DVLConst.prototype.lazyValue = function() {
    return this;
  };

  DVLConst.prototype.update = function() {
    return this;
  };

  DVLConst.prototype.get = function() {
    return this.v;
  };

  DVLConst.prototype.getPrev = function() {
    return this.v;
  };

  DVLConst.prototype.hasChanged = function() {
    return this.changed;
  };

  DVLConst.prototype.resetChanged = function() {
    return null;
  };

  DVLConst.prototype.notify = function() {
    return null;
  };

  DVLConst.prototype.discard = function() {
    return null;
  };

  DVLConst.prototype.name = function() {
    var _ref1;

    if (arguments.length === 0) {
      return (_ref1 = this.n) != null ? _ref1 : '<anon_const>';
    } else {
      this.n = arguments[0];
      return this;
    }
  };

  DVLConst.prototype.compare = function() {
    if (arguments.length) {
      return this;
    } else {
      return default_compare;
    }
  };

  DVLConst.prototype.verify = function() {
    if (arguments.length) {
      return this;
    } else {
      return null;
    }
  };

  DVLConst.prototype.apply = function(fn) {
    return dvl.apply(this, fn);
  };

  DVLConst.prototype.applyValid = function(fn) {
    return dvl.applyValid(this, fn);
  };

  DVLConst.prototype.applyAlways = function(fn) {
    return dvl.applyAlways(this, fn);
  };

  DVLConst.prototype.pluck = function(prop) {
    return dvl.apply(this, function(d) {
      return d[prop];
    });
  };

  DVLConst.prototype.pluckEx = function(prop) {
    return dvl.apply(this, function(d) {
      return d[prop]();
    });
  };

  DVLConst.prototype.project = function(fns) {
    return dvl["const"]((this.v != null) && (fns != null ? fns.down : void 0) ? fns.down.call(null, this.v) : null);
  };

  return DVLConst;

})();

DVLVar = (function() {
  function DVLVar(val) {
    this.v = val != null ? val : null;
    this.id = nextObjId++;
    this.prev = null;
    this.changed = false;
    this.vlen = -1;
    this.lazy = null;
    this.listeners = [];
    this.changers = [];
    this.compareFn = default_compare;
    variables.push(this);
    if (curBlock) {
      curBlock.addMemeber(this);
    }
    return this;
  }

  DVLVar.prototype.resolveLazy = function() {
    if (this.lazy) {
      this.prev = this.v;
      this.v = this.lazy();
      this.lazy = null;
    }
  };

  DVLVar.prototype.toString = function() {
    var tag;

    tag = this.n ? this.n + ':' : '';
    return "[" + this.tag + this.val + "]";
  };

  DVLVar.prototype.hasChanged = function() {
    if (this.proj) {
      return this.proj.parent.hasChanged();
    } else {
      return this.changed;
    }
  };

  DVLVar.prototype.resetChanged = function() {
    this.changed = false;
    return this;
  };

  DVLVar.prototype.value = function(val) {
    var fnDown, parent, pv, _ref1;

    if (arguments.length) {
      val = val != null ? val : null;
      if (val !== null && this.verifyFn && !this.verifyFn.call(this, val)) {
        return this;
      }
      if (this.compareFn && this.compareFn.call(this, val, this.value())) {
        return this;
      }
      this.set(val);
      dvl.notify(this);
      return this;
    } else {
      if (this.proj) {
        _ref1 = this.proj, parent = _ref1.parent, fnDown = _ref1.fnDown;
        pv = parent.value();
        this.v = pv != null ? fnDown.call(this.v, pv) : null;
      } else {
        this.resolveLazy();
      }
      return this.v;
    }
  };

  DVLVar.prototype.set = function(val) {
    var fnUp, parent, _ref1;

    val = val != null ? val : null;
    if (this.proj) {
      _ref1 = this.proj, parent = _ref1.parent, fnUp = _ref1.fnUp;
      parent.value(fnUp.call(parent.value(), val));
      return this;
    }
    if (!this.changed) {
      this.prev = this.v;
    }
    this.v = val;
    this.changed = true;
    this.lazy = null;
    return this;
  };

  DVLVar.prototype.lazyValue = function(fn) {
    this.lazy = fn;
    this.changed = true;
    dvl.notify(this);
    return this;
  };

  DVLVar.prototype.update = function(val) {
    if (!utilModule.isEqual(val, this.v)) {
      this.set(val);
      dvl.notify(this);
    }
    return this;
  };

  DVLVar.prototype.get = function() {
    return this.value();
  };

  DVLVar.prototype.getPrev = function() {
    this.resolveLazy();
    if (this.prev && this.changed) {
      return this.prev;
    } else {
      return this.v;
    }
  };

  DVLVar.prototype.notify = function() {
    return dvl.notify(this);
  };

  DVLVar.prototype.discard = function() {
    if (this.listeners.length > 0) {
      throw "Cannot remove variable " + this.id + " because it has listeners.";
    }
    if (this.changers.length > 0) {
      throw "Cannot remove variable " + this.id + " because it has changers.";
    }
    variables.splice(variables.indexOf(this), 1);
    return null;
  };

  DVLVar.prototype.name = function() {
    var _ref1;

    if (arguments.length === 0) {
      return (_ref1 = this.n) != null ? _ref1 : '<anon>';
    } else {
      this.n = arguments[0];
      return this;
    }
  };

  DVLVar.prototype.compare = function() {
    if (arguments.length) {
      this.compareFn = arguments[0];
      return this;
    } else {
      return this.compareFn;
    }
  };

  DVLVar.prototype.verify = function() {
    if (arguments.length) {
      this.verifyFn = arguments[0];
      return this;
    } else {
      return this.verifyFn;
    }
  };

  DVLVar.prototype.apply = function(fn) {
    return dvl.apply(this, fn);
  };

  DVLVar.prototype.applyValid = function(fn) {
    return dvl.applyValid(this, fn);
  };

  DVLVar.prototype.applyAlways = function(fn) {
    return dvl.applyAlways(this, fn);
  };

  DVLVar.prototype.pluck = function(prop) {
    return dvl.apply(this, function(d) {
      return d[prop];
    });
  };

  DVLVar.prototype.pluckEx = function(prop) {
    return dvl.apply(this, function(d) {
      return d[prop]();
    });
  };

  DVLVar.prototype.project = function(fns) {
    var me, v;

    fns = dvl.wrap(fns);
    v = dvl();
    me = this;
    dvl.register({
      listen: fns,
      change: me,
      fn: function() {
        var _fns;

        _fns = fns.value();
        if (!_fns) {
          _fns = {
            down: function() {
              return null;
            },
            up: function() {}
          };
        }
        v.proj = {
          parent: me,
          fnDown: _fns.down,
          fnUp: _fns.up
        };
        me.notify();
      }
    });
    return v;
  };

  return DVLVar;

})();

getBase = function(v) {
  while (v.proj) {
    v = v.proj.parent;
  }
  return v;
};

dvl.def = function(value) {
  return new DVLVar(value);
};

dvl["const"] = function(value) {
  return new DVLConst(value);
};

dvl.knows = function(v) {
  return v instanceof DVLVar || v instanceof DVLConst;
};

DVLWorker = (function() {
  function DVLWorker(name, ctx, fn, listen, change) {
    var hasPrev, lvl, min, nextWorker, nwid, prevWorker, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _ref3, _ref4, _ref5;

    this.name = name;
    this.ctx = ctx;
    this.fn = fn;
    this.listen = listen;
    this.change = change;
    this.id = nextObjId++;
    this.updates = new Set();
    this.level = workers.length;
    workers.push(this);
    hasPrev = false;
    _ref1 = this.listen;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      v = _ref1[_i];
      v.listeners.push(this);
      _ref2 = v.changers;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        prevWorker = _ref2[_j];
        prevWorker.updates.add(this);
        hasPrev = true;
      }
    }
    _ref3 = this.change;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      v = _ref3[_k];
      v.changers.push(this);
      _ref4 = v.listeners;
      for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
        nextWorker = _ref4[_l];
        this.updates.add(nextWorker);
      }
    }
    if (this.updates.length()) {
      min = Infinity;
      _ref5 = this.updates.valueOf();
      for (nwid in _ref5) {
        nextWorker = _ref5[nwid];
        lvl = nextWorker.level;
        if (lvl < min) {
          min = lvl;
        }
      }
      sortGraph(min);
    }
    if (curBlock) {
      curBlock.addMemeber(this);
    }
  }

  DVLWorker.prototype.addChange = function() {
    var nextWorker, updatesChanged, uv, v, _i, _j, _len, _len1, _ref1;

    uv = uniqById(arguments);
    if (uv.length) {
      updatesChanged = false;
      for (_i = 0, _len = uv.length; _i < _len; _i++) {
        v = uv[_i];
        this.change.push(v);
        v.changers.push(this);
        _ref1 = v.listeners;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          nextWorker = _ref1[_j];
          this.updates.add(nextWorker);
          updatesChanged = true;
        }
      }
      if (updatesChanged) {
        sortGraph();
      }
    }
    return this;
  };

  DVLWorker.prototype.addListen = function() {
    var changedSave, hasPrev, i, prevWorker, updatesChanged, uv, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1;

    uv = uniqById(arguments);
    if (uv.length) {
      updatesChanged = false;
      for (_i = 0, _len = uv.length; _i < _len; _i++) {
        v = uv[_i];
        this.listen.push(v);
        v.listeners.push(this);
        _ref1 = v.changers;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          prevWorker = _ref1[_j];
          prevWorker.updates.add(this);
          updatesChanged = true;
          hasPrev = false;
        }
      }
      if (updatesChanged) {
        sortGraph();
      }
    }
    uv = uniqById(arguments, true);
    start_notify_collect(this);
    changedSave = [];
    for (_k = 0, _len2 = uv.length; _k < _len2; _k++) {
      v = uv[_k];
      changedSave.push(v.changed);
      v.changed = true;
    }
    this.fn.apply(this.ctx);
    for (i = _l = 0, _len3 = uv.length; _l < _len3; i = ++_l) {
      v = uv[i];
      v.changed = changedSave[i];
    }
    end_notify_collect();
    return this;
  };

  DVLWorker.prototype.discard = function() {
    var prevWorker, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _ref3, _ref4;

    workers.splice(workers.indexOf(this), 1);
    _ref1 = this.listen;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      v = _ref1[_i];
      _ref2 = v.changers;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        prevWorker = _ref2[_j];
        prevWorker.updates.remove(this);
      }
    }
    _ref3 = this.change;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      v = _ref3[_k];
      v.changers.splice(v.changers.indexOf(this), 1);
    }
    _ref4 = this.listen;
    for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
      v = _ref4[_l];
      v.listeners.splice(v.listeners.indexOf(this), 1);
    }
    sortGraph();
    this.change = this.listen = this.updates = null;
  };

  return DVLWorker;

})();

dvl.register = function(_arg) {
  var c, change, changedSave, ctx, fn, i, l, listen, listenConst, name, noRun, v, worker, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m;

  ctx = _arg.ctx, fn = _arg.fn, listen = _arg.listen, change = _arg.change, name = _arg.name, noRun = _arg.noRun;
  if (curNotifyListener) {
    throw new Error('cannot call register from within a notify');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('fn must be a function');
  }
  if (dvl.typeOf(listen) !== 'array') {
    listen = [listen];
  }
  if (dvl.typeOf(change) !== 'array') {
    change = [change];
  }
  listenConst = [];
  if (listen) {
    for (_i = 0, _len = listen.length; _i < _len; _i++) {
      v = listen[_i];
      if (v instanceof DVLConst) {
        listenConst.push(v);
      }
    }
  }
  listen = uniqById(listen).map(getBase);
  change = uniqById(change).map(getBase);
  worker = new DVLWorker(name || 'fn', ctx, fn, listen, change);
  if (!noRun) {
    changedSave = [];
    for (i = _j = 0, _len1 = listen.length; _j < _len1; i = ++_j) {
      l = listen[i];
      changedSave[i] = l.changed;
      l.changed = true;
    }
    for (_k = 0, _len2 = listenConst.length; _k < _len2; _k++) {
      l = listenConst[_k];
      l.changed = true;
    }
    start_notify_collect(worker);
    fn.call(ctx);
    end_notify_collect();
    for (i = _l = 0, _len3 = changedSave.length; _l < _len3; i = ++_l) {
      c = changedSave[i];
      listen[i].changed = c;
    }
    for (_m = 0, _len4 = listenConst.length; _m < _len4; _m++) {
      l = listenConst[_m];
      l.changed = false;
    }
  }
  return worker;
};

DVLBlock = (function() {
  function DVLBlock(name, parent) {
    var _ref1;

    this.name = name;
    this.parent = parent;
    this.owns = {};
    if ((_ref1 = this.parent) != null) {
      _ref1.add(this);
    }
    return;
  }

  DVLBlock.prototype.addMemeber = function(thing) {
    this.owns[thing.id] = thing;
    return this;
  };

  DVLBlock.prototype.removeMemeber = function(thing) {
    delete this.owns[thing.id];
    return this;
  };

  DVLBlock.prototype.discard = function() {
    var d, _i, _len, _ref1, _ref2;

    if ((_ref1 = this.parent) != null) {
      _ref1.removeMemeber(this);
    }
    _ref2 = this.owns;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      d = _ref2[_i];
      d.discard();
    }
  };

  return DVLBlock;

})();

dvl.blockFn = function() {
  var fn, name;

  switch (arguments.length) {
    case 1:
      fn = arguments[0];
      break;
    case 2:
      name = arguments[0], fn = arguments[1];
      break;
    default:
      throw "bad number of arguments";
  }
  return function() {
    var args, block, ret;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    block = new DVLBlock(name, curBlock);
    ret = fn.apply(this, args);
    curBlock = block.parent;
    return ret;
  };
};

dvl.block = function() {
  var block, fn, name;

  switch (arguments.length) {
    case 1:
      fn = arguments[0];
      break;
    case 2:
      name = arguments[0], fn = arguments[1];
      break;
    default:
      throw "bad number of arguments";
  }
  block = new DVLBlock(name, curBlock);
  fn.call(this);
  curBlock = block.parent;
  return block;
};

dvl.group = function(fn) {
  return function() {
    var captured_notifies, fnArgs, ret;

    fnArgs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (dvl.notify === init_notify) {
      captured_notifies = [];
      dvl.notify = function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        Array.prototype.push.apply(captured_notifies, args);
      };
      ret = fn.apply(this, fnArgs);
      dvl.notify = init_notify;
      init_notify.apply(dvl, captured_notifies);
    } else {
      ret = fn.apply(this, fnArgs);
    }
    return ret;
  };
};

dvl.wrapConstIfNeeded = dvl.wrap = function(v, name) {
  if (v === void 0) {
    v = null;
  }
  if (dvl.knows(v)) {
    return v;
  } else {
    return dvl["const"](v).name(name);
  }
};

dvl.wrapVarIfNeeded = dvl.wrapVar = function(v, name) {
  if (v === void 0) {
    v = null;
  }
  if (dvl.knows(v)) {
    return v;
  } else {
    return dvl(v).name(name);
  }
};

dvl.valueOf = function(v) {
  if (dvl.knows(v)) {
    return v.value();
  } else {
    return v != null ? v : null;
  }
};

nsId = 0;

dvl.namespace = function(str) {
  if (str == null) {
    str = 'ns';
  }
  nsId++;
  return str + nsId;
};

uniqById = function(vs, allowConst) {
  var res, seen, v, _i, _len;

  res = [];
  if (vs) {
    seen = {};
    for (_i = 0, _len = vs.length; _i < _len; _i++) {
      v = vs[_i];
      if ((v != null) && (allowConst || (v.listeners && v.changers)) && !seen[v.id]) {
        seen[v.id] = true;
        res.push(v);
      }
    }
  }
  return res;
};

dvl.sortGraph = sortGraph = function(from) {
  var getInboundCount, i, ic, idPriorityQueue, inboundCount, isSource, j, level, nextWorker, nwid, prevWorker, v, worker, workerListen, workerListenLength, workersLength, _i, _len, _ref1, _ref2, _sources;

  if (from == null) {
    from = 0;
  }
  idPriorityQueue = new PriorityQueue('id');
  getInboundCount = function(worker, from) {
    var count, prevWorker, seen, v, _i, _j, _len, _len1, _ref1, _ref2;

    seen = {};
    count = 0;
    _ref1 = worker.listen;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      v = _ref1[_i];
      _ref2 = v.changers;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        prevWorker = _ref2[_j];
        if (from <= prevWorker.level && !seen[prevWorker.id]) {
          seen[prevWorker.id] = true;
          ++count;
        }
      }
    }
    return count;
  };
  inboundCount = {};
  _sources = [];
  i = from;
  workersLength = workers.length;
  while (i < workersLength) {
    worker = workers[i++];
    isSource = true;
    j = 0;
    workerListen = worker.listen;
    workerListenLength = workerListen.length;
    while (j < workerListenLength && isSource) {
      v = workerListen[j++];
      _ref1 = v.changers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        prevWorker = _ref1[_i];
        if (from <= prevWorker.level) {
          isSource = false;
          break;
        }
      }
    }
    if (isSource) {
      idPriorityQueue.push(worker);
    }
  }
  level = from;
  while (idPriorityQueue.length()) {
    worker = idPriorityQueue.shift();
    workers[worker.level = level++] = worker;
    _ref2 = worker.updates.valueOf();
    for (nwid in _ref2) {
      nextWorker = _ref2[nwid];
      ic = inboundCount[nwid] || getInboundCount(nextWorker, from);
      ic--;
      if (ic === 0) {
        idPriorityQueue.push(nextWorker);
      } else {
        inboundCount[nwid] = ic;
      }
    }
  }
  if (level !== workers.length) {
    throw new Error('there is a cycle');
  }
};

dvl.clearAll = function() {
  var v, worker, _i, _j, _len, _len1;

  for (_i = 0, _len = workers.length; _i < _len; _i++) {
    worker = workers[_i];
    worker.listen = worker.change = worker.updates = null;
  }
  for (_j = 0, _len1 = variables.length; _j < _len1; _j++) {
    v = variables[_j];
    v.listeners = v.changers = null;
  }
  nextObjId = 1;
  variables = [];
  workers = [];
};

levelPriorityQueue = new PriorityQueue('level');

curNotifyListener = null;

curCollectListener = null;

toNotify = null;

start_notify_collect = function(listener) {
  toNotify = [];
  curCollectListener = listener;
  dvl.notify = collect_notify;
};

end_notify_collect = function() {
  curCollectListener = null;
  dvl.notify = init_notify;
  dvl.notify.apply(null, toNotify);
  toNotify = null;
};

collect_notify = function() {
  var v, _i, _len;

  if (!curCollectListener) {
    throw new Error('bad stuff happened during a collect block');
  }
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    v = arguments[_i];
    if (!(v instanceof DVLVar)) {
      continue;
    }
    v = getBase(v);
    if (__indexOf.call(curCollectListener.change, v) < 0) {
      throw new Error("changed unregistered object " + v.id + " (collect)");
    }
    toNotify.push(v);
  }
};

dvl.notify = init_notify = function() {
  var changedInNotify, l, lastNotifyRun, notifyChainReset, v, visitedListener, _i, _j, _len, _len1, _ref1;

  lastNotifyRun = [];
  visitedListener = [];
  changedInNotify = [];
  curNotifyListener = null;
  notifyChainReset = function() {
    var l, v, _i, _j, _len, _len1;

    curNotifyListener = null;
    dvl.notify = init_notify;
    for (_i = 0, _len = changedInNotify.length; _i < _len; _i++) {
      v = changedInNotify[_i];
      v.resetChanged();
    }
    for (_j = 0, _len1 = visitedListener.length; _j < _len1; _j++) {
      l = visitedListener[_j];
      l.visited = false;
    }
  };
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    v = arguments[_i];
    if (!(v instanceof DVLVar)) {
      continue;
    }
    v = getBase(v);
    changedInNotify.push(v);
    lastNotifyRun.push(v.id);
    _ref1 = v.listeners;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      l = _ref1[_j];
      levelPriorityQueue.push(l);
    }
  }
  dvl.notify = function() {
    var errorMessage, prevStr, _k, _l, _len2, _len3, _ref2;

    if (!curNotifyListener) {
      throw new Error('bad stuff happened within a notify block');
    }
    for (_k = 0, _len2 = arguments.length; _k < _len2; _k++) {
      v = arguments[_k];
      if (!(v instanceof DVLVar)) {
        continue;
      }
      v = getBase(v);
      if (__indexOf.call(curNotifyListener.change, v) < 0) {
        prevStr = changedInNotify.map(function(v) {
          return v.id;
        }).join(';');
        errorMessage = "changed unregistered object " + v.id + " within worker " + curNotifyListener.id + " [prev:" + prevStr + "]";
        notifyChainReset();
        throw new Error(errorMessage);
      }
      changedInNotify.push(v);
      lastNotifyRun.push(v.id);
      _ref2 = v.listeners;
      for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
        l = _ref2[_l];
        if (!l.visited) {
          levelPriorityQueue.push(l);
        }
      }
    }
  };
  while (levelPriorityQueue.length() > 0) {
    curNotifyListener = levelPriorityQueue.shift();
    if (curNotifyListener.visited) {
      continue;
    }
    curNotifyListener.visited = true;
    visitedListener.push(curNotifyListener);
    lastNotifyRun.push(curNotifyListener.id);
    curNotifyListener.fn.apply(curNotifyListener.ctx);
  }
  notifyChainReset();
};

dvl.zero = dvl["const"](0).name('zero');

dvl["null"] = dvl["const"](null).name('null');

dvl.ident = function(x) {
  return x;
};

dvl.identity = dvl["const"](dvl.ident).name('identity');

dvl.acc = function(column) {
  var acc, makeAcc;

  column = dvl.wrap(column);
  acc = dvl().name("acc");
  makeAcc = function() {
    var col;

    col = column.value();
    if (col != null) {
      col = String(col.valueOf());
      return acc.value(function(d) {
        return d[col];
      });
    } else {
      return acc.value(null);
    }
  };
  dvl.register({
    fn: makeAcc,
    listen: [column],
    change: [acc],
    name: 'make_acc'
  });
  return acc;
};

dvl.debug = function() {
  var note, obj, print;

  print = function() {
    if (!(typeof console !== "undefined" && console !== null ? console.log : void 0)) {
      return;
    }
    console.log.apply(console, arguments);
    return arguments[0];
  };
  if (arguments.length === 1) {
    obj = dvl.wrap(arguments[0]);
    note = obj.name() + ':';
  } else {
    obj = dvl.wrap(arguments[1]);
    note = arguments[0];
  }
  dvl.register({
    listen: [obj],
    fn: function() {
      return print(note, obj.value());
    }
  });
  return obj;
};

dvl.apply = dvl.applyValid = function() {
  var allowNull, args, fn, invalid, out, update, _ref1, _ref2;

  switch (arguments.length) {
    case 1:
      _ref1 = arguments[0], args = _ref1.args, fn = _ref1.fn, invalid = _ref1.invalid, allowNull = _ref1.allowNull, update = _ref1.update;
      if (args === void 0 && !arguments[0].hasOwnProperty('args')) {
        args = [];
      }
      break;
    case 2:
      args = arguments[0], fn = arguments[1];
      break;
    case 3:
      args = arguments[0], (_ref2 = arguments[1], invalid = _ref2.invalid, allowNull = _ref2.allowNull, update = _ref2.update), fn = arguments[2];
      break;
    default:
      throw "incorect number of arguments";
  }
  fn = dvl.wrap(fn || dvl.identity);
  if (!Array.isArray(args)) {
    args = [args];
  }
  args = args.map(dvl.wrap);
  invalid = dvl.wrap(invalid != null ? invalid : null);
  out = dvl(invalid.value()).name('apply_valid_out');
  dvl.register({
    name: 'apply_fn',
    listen: args.concat([fn, invalid]),
    change: out,
    fn: function() {
      var a, f, nulls, r, send, v, _i, _len;

      f = fn.value();
      if (f == null) {
        return;
      }
      send = [];
      nulls = false;
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        a = args[_i];
        v = a.value();
        if (v == null) {
          nulls = true;
        }
        send.push(v);
      }
      if (!nulls || allowNull) {
        r = f.apply(null, send);
        if (r === void 0) {
          return;
        }
      } else {
        r = invalid.value();
      }
      if (update) {
        out.update(r);
      } else {
        out.set(r).notify();
      }
    }
  });
  return out;
};

dvl.applyAlways = function() {
  var args, fn, out, update, _ref1, _ref2;

  switch (arguments.length) {
    case 1:
      _ref1 = arguments[0], args = _ref1.args, fn = _ref1.fn, update = _ref1.update;
      if (args === void 0 && !arguments[0].hasOwnProperty('args')) {
        args = [];
      }
      break;
    case 2:
      args = arguments[0], fn = arguments[1];
      break;
    case 3:
      args = arguments[0], (_ref2 = arguments[1], update = _ref2.update), fn = arguments[2];
      break;
    default:
      throw "incorect number of arguments";
  }
  fn = dvl.wrap(fn || dvl.identity);
  if (!Array.isArray(args)) {
    args = [args];
  }
  args = args.map(dvl.wrap);
  out = dvl().name('apply_valid_out');
  dvl.register({
    name: 'apply_fn',
    listen: args.concat([fn]),
    change: out,
    fn: function() {
      var a, f, r, send, _i, _len;

      f = fn.value();
      if (f == null) {
        return;
      }
      send = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        a = args[_i];
        send.push(a.value());
      }
      r = f.apply(null, send);
      if (r === void 0) {
        return;
      }
      if (update) {
        out.update(r);
      } else {
        out.set(r).notify();
      }
    }
  });
  return out;
};

dvl.chain = function(f, h) {
  var out;

  f = dvl.wrap(f);
  h = dvl.wrap(h);
  out = dvl().name('chain');
  dvl.register({
    listen: [f, h],
    change: [out],
    fn: function() {
      var _f, _h;

      _f = f.value();
      _h = h.value();
      if (_f && _h) {
        out.value(function(x) {
          return _h(_f(x));
        });
      } else {
        out.value(null);
      }
    }
  });
  return out;
};

dvl.op = function(fn) {
  var liftedFn;

  liftedFn = lift(fn);
  return function() {
    var args, out;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    args = args.map(dvl.wrap);
    out = dvl();
    dvl.register({
      listen: args,
      change: [out],
      fn: function() {
        out.set(liftedFn.apply(null, args.map(function(v) {
          return v.value();
        })));
        dvl.notify(out);
      }
    });
    return out;
  };
};

op_to_lift = {
  'or': function() {
    var arg, ret, _i, _len;

    ret = false;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      ret || (ret = arg);
    }
    return ret;
  },
  'and': function() {
    var arg, ret, _i, _len;

    ret = true;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      ret && (ret = arg);
    }
    return ret;
  },
  'add': function() {
    var arg, sum, _i, _len;

    sum = 0;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      if (arg != null) {
        sum += arg;
      } else {
        return null;
      }
    }
    return sum;
  },
  'sub': function() {
    var arg, mult, sum, _i, _len;

    sum = 0;
    mult = 1;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      if (arg != null) {
        sum += arg * mult;
        mult = -1;
      } else {
        return null;
      }
    }
    return sum;
  },
  'list': function() {
    var arg, args, _i, _len;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      if (arg == null) {
        return null;
      }
    }
    return args;
  },
  'concat': function() {
    var arg, args, _i, _len;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      if (arg == null) {
        return null;
      }
    }
    return args.join('');
  },
  'iff': function(cond, truthy, falsy) {
    if (cond) {
      return truthy;
    } else {
      return falsy;
    }
  },
  'iffEq': function(lhs, rhs, truthy, falsy) {
    if (lhs === rhs) {
      return truthy;
    } else {
      return falsy;
    }
  },
  'iffLt': function(lhs, rhs, truthy, falsy) {
    if (lhs < rhs) {
      return truthy;
    } else {
      return falsy;
    }
  },
  'makeTranslate': function(x, y) {
    if ((x != null) && (y != null)) {
      return "translate(" + x + "," + y + ")";
    } else {
      return null;
    }
  }
};

for (k in op_to_lift) {
  fn = op_to_lift[k];
  dvl.op[k] = dvl.op(fn);
}

module.exports = dvl;
