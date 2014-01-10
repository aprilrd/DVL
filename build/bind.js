// Generated by CoffeeScript 1.6.2
var bind, bindSingle, class_concat, def_data_fn, dvl, id_class_spliter;

dvl = require('./core');

id_class_spliter = /(?=[#.:])/;

def_data_fn = dvl["const"](function(d) {
  return [d];
});

class_concat = dvl.op(function(s, d) {
  return s + ' ' + (d || '');
});

bind = function(_arg) {
  var argsOn, attr, attrList, data, html, join, k, listen, nodeType, onList, out, parent, part, parts, property, propertyList, self, staticClass, staticId, style, styleList, text, transition, transitionExit, v, _i, _len;

  parent = _arg.parent, self = _arg.self, data = _arg.data, join = _arg.join, attr = _arg.attr, style = _arg.style, property = _arg.property, text = _arg.text, html = _arg.html, argsOn = _arg.on, transition = _arg.transition, transitionExit = _arg.transitionExit;
  if (!parent) {
    throw "'parent' not defined";
  }
  if (typeof self !== 'string') {
    throw "'self' not defined";
  }
  parts = self.split(id_class_spliter);
  nodeType = parts.shift();
  staticId = null;
  staticClass = [];
  for (_i = 0, _len = parts.length; _i < _len; _i++) {
    part = parts[_i];
    switch (part[0]) {
      case '#':
        staticId = part.substring(1);
        break;
      case '.':
        staticClass.push(part.substring(1));
        break;
      default:
        throw "not currently supported in 'self' (" + part + ")";
    }
  }
  staticClass = staticClass.join(' ');
  parent = dvl.wrap(parent);
  data = dvl.wrap(data || def_data_fn);
  join = dvl.wrap(join);
  text = text ? dvl.wrap(text) : null;
  html = html ? dvl.wrap(html) : null;
  transition = dvl.wrap(transition);
  transitionExit = dvl.wrap(transitionExit);
  listen = [parent, data, join, text, html, transition, transitionExit];
  attrList = {};
  for (k in attr) {
    v = attr[k];
    v = dvl.wrap(v);
    if (k === 'class' && staticClass) {
      v = class_concat(staticClass, v);
    }
    listen.push(v);
    attrList[k] = v;
  }
  if (staticClass && !attrList['class']) {
    attrList['class'] = dvl["const"](staticClass);
  }
  styleList = {};
  for (k in style) {
    v = style[k];
    v = dvl.wrap(v);
    listen.push(v);
    styleList[k] = v;
  }
  propertyList = {};
  for (k in property) {
    v = property[k];
    v = dvl.wrap(v);
    listen.push(v);
    propertyList[k] = v;
  }
  onList = {};
  for (k in argsOn) {
    v = argsOn[k];
    v = dvl.wrap(v);
    listen.push(v);
    onList[k] = v;
  }
  out = dvl().name('selection');
  dvl.register({
    listen: listen,
    change: [out],
    fn: function() {
      var a, add1, add2, addO, e, enter, ex, force, postTrans, preTrans, s, t, _data, _j, _join, _k, _l, _len1, _len2, _len3, _parent, _transition, _transitionExit;

      _parent = parent.value();
      if (!_parent) {
        return;
      }
      force = parent.hasChanged() || data.hasChanged() || join.hasChanged();
      _data = data.value();
      _join = join.value();
      if (_data) {
        _data = _data.valueOf();
        _transition = transition.value();
        _transitionExit = transitionExit.value();
        enter = [];
        preTrans = [];
        postTrans = [];
        add1 = function(fn, v) {
          if (v.hasChanged() || force) {
            preTrans.push({
              fn: fn,
              a1: v.getPrev()
            });
            postTrans.push({
              fn: fn,
              a1: v.value()
            });
          } else {
            enter.push({
              fn: fn,
              a1: v.value()
            });
          }
        };
        add2 = function(fn, k, v) {
          if (v.hasChanged() || force) {
            enter.push({
              fn: fn,
              a1: k,
              a2: v.getPrev()
            });
            preTrans.push({
              fn: fn,
              a1: k,
              a2: v.getPrev()
            });
            postTrans.push({
              fn: fn,
              a1: k,
              a2: v.value()
            });
          } else {
            enter.push({
              fn: fn,
              a1: k,
              a2: v.value()
            });
          }
        };
        addO = function(fn, k, v) {
          if (v.hasChanged() || force) {
            preTrans.push({
              fn: fn,
              a1: k,
              a2: v.value()
            });
          } else {
            enter.push({
              fn: fn,
              a1: k,
              a2: v.value()
            });
          }
        };
        if (text) {
          add1('text', text);
        }
        if (html) {
          add1('html', html);
        }
        for (k in attrList) {
          v = attrList[k];
          add2('attr', k, v);
        }
        for (k in styleList) {
          v = styleList[k];
          add2('style', k, v);
        }
        for (k in propertyList) {
          v = propertyList[k];
          add2('property', k, v);
        }
        for (k in onList) {
          v = onList[k];
          addO('on', k, v);
        }
        s = _parent.selectAll(self).data(_data, _join);
        e = s.enter().append(nodeType);
        for (_j = 0, _len1 = enter.length; _j < _len1; _j++) {
          a = enter[_j];
          e[a.fn](a.a1, a.a2);
        }
        for (_k = 0, _len2 = preTrans.length; _k < _len2; _k++) {
          a = preTrans[_k];
          s[a.fn](a.a1, a.a2);
        }
        if (_transition && (_transition.duration != null)) {
          t = s.transition();
          t.duration(_transition.duration || 1000);
          if (_transition.delay) {
            t.delay(_transition.delay);
          }
          if (_transition.ease) {
            t.ease(_transition.ease);
          }
        } else {
          t = s;
        }
        for (_l = 0, _len3 = postTrans.length; _l < _len3; _l++) {
          a = postTrans[_l];
          t[a.fn](a.a1, a.a2);
        }
        ex = s.exit().remove();
        if (!e.empty() || !ex.empty() || force) {
          out.value(s);
        }
      } else {
        s = _parent.selectAll(self).remove();
        out.value(s);
      }
    }
  });
  return out;
};

bindSingle = function(_arg) {
  var argsOn, attr, attrList, data, datum, html, k, listen, nodeType, onList, parent, part, parts, property, propertyList, self, staticClass, staticId, style, styleList, text, transition, v, _i, _len;

  parent = _arg.parent, self = _arg.self, data = _arg.data, datum = _arg.datum, attr = _arg.attr, style = _arg.style, property = _arg.property, text = _arg.text, html = _arg.html, argsOn = _arg.on, transition = _arg.transition;
  if (data) {
    throw new Error("bindSingle does not accept a parameter 'data'. Did you mean 'datum'?");
  }
  if (typeof self === 'string') {
    if (!parent) {
      throw "'parent' not defined for string self";
    }
    parts = self.split(id_class_spliter);
    nodeType = parts.shift();
    staticId = null;
    staticClass = [];
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      switch (part[0]) {
        case '#':
          staticId = part.substring(1);
          break;
        case '.':
          staticClass.push(part.substring(1));
          break;
        default:
          throw "not currently supported in 'self' (" + part + ")";
      }
    }
    staticClass = staticClass.join(' ');
    self = dvl.valueOf(parent).append(nodeType);
    self.attr('id', staticId) === staticId;
    self.attr('class', staticClass) === staticClass;
  } else {
    staticClass = self.attr('class');
  }
  self = dvl.wrapVar(self);
  datum = dvl.wrap(datum);
  text = text ? dvl.wrap(text) : null;
  html = html ? dvl.wrap(html) : null;
  transition = dvl.wrap(transition);
  listen = [datum, text, html, transition];
  attrList = {};
  for (k in attr) {
    v = attr[k];
    v = dvl.wrap(v);
    if (k === 'class' && staticClass) {
      v = class_concat(staticClass, v);
    }
    listen.push(v);
    attrList[k] = v;
  }
  styleList = {};
  for (k in style) {
    v = style[k];
    v = dvl.wrap(v);
    listen.push(v);
    styleList[k] = v;
  }
  propertyList = {};
  for (k in property) {
    v = property[k];
    v = dvl.wrap(v);
    listen.push(v);
    propertyList[k] = v;
  }
  onList = {};
  for (k in argsOn) {
    v = argsOn[k];
    v = dvl.wrap(v);
    listen.push(v);
    onList[k] = v;
  }
  dvl.register({
    listen: listen,
    change: [self],
    fn: function() {
      var force, sel, _datum;

      sel = self.value();
      _datum = datum.value();
      force = datum.hasChanged();
      if (force) {
        sel.datum(_datum);
      }
      for (k in attrList) {
        v = attrList[k];
        if (v.hasChanged() || force) {
          sel.attr(k, v.value());
        }
      }
      for (k in styleList) {
        v = styleList[k];
        if (v.hasChanged() || force) {
          sel.style(k, v.value());
        }
      }
      for (k in propertyList) {
        v = propertyList[k];
        if (v.hasChanged() || force) {
          sel.property(k, v.value());
        }
      }
      for (k in onList) {
        v = onList[k];
        if (v.hasChanged() || force) {
          sel.on(k, v.value());
        }
      }
      if (text && (text.hasChanged() || force)) {
        sel.text(text.value());
      }
      if (html && (html.hasChanged() || force)) {
        sel.html(html.value());
      }
      if (force) {
        self.notify();
      }
    }
  });
  return self;
};

module.exports = {
  bind: bind,
  bindSingle: bindSingle
};