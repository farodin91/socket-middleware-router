var pathToRegExp = require('path-to-regexp');

module.exports = Layer;

function Layer(path, middleware, opts) {
  this.opts = opts || {};
  this.name = this.opts.name || null;
  this.paramNames = [];
  this.fns = {
    params: {},
    middleware: []
  };

  if (!Array.isArray(middleware)) {
    middleware = [middleware];
  }

  // ensure middleware is a function
  middleware.forEach(function(fn) {
    var type = (typeof fn);
    if (type !== 'function') {
      throw new Error(
        " `" + (this.opts.name || path) +"`: `middleware` "
        + "must be a function, not `" + type + "`"
      );
    }
  }, this);

  this.fns.middleware = middleware;

  if (middleware.length > 1) {
    this.middleware = compose(middleware);
  }
  else {
    this.middleware = middleware[0];
  }

  this.path = path;
  this.regexp = pathToRegExp(path, this.paramNames, this.opts);
};

Layer.prototype.match = function (path) {
  return this.regexp.test(path);
};

Layer.prototype.params = function (path, captures, existingParams) {
  var params = existingParams || {};
  for (var len = captures.length, i=0; i<len; i++) {
    if (this.paramNames[i]) {
      var c = captures[i];
      params[this.paramNames[i].name] = c ? safeDecodeURIComponent(c) : c;
    }
  }
  return params;
};

Layer.prototype.captures = function (path) {
  return path.match(this.regexp).slice(1);
};

Layer.prototype.param = function (param, fn) {
  var middleware = [];

  this.fns.params[param] = function *(next) {
    yield *fn.call(this, this.params[param], next);
  };

  this.paramNames.forEach(function(param) {
    var fn = this.fns.params[param.name];
    if (fn) {
      middleware.push(fn);
    }
  }, this);

  this.middleware = compose(middleware.concat(this.fns.middleware));

  return this;
};


function safeDecodeURIComponent(text) {
 try {
   return decodeURIComponent(text);
 } catch (e) {
   return text;
 }
}
