
var Layer = require('./layer');

module.exports = Router;

function Router(opts) {
  if (!(this instanceof Router)) {
    return new Router(opts);
  }
  this.opts = opts || {};
  this.params = {};
  this.stack = [];
  this.middleware = [];
  this.debug = false;
};

Router.prototype.request = function (path, middleware) {
  // create route
  var route = new Layer(path, middleware);

  // add parameter middleware
  Object.keys(this.params).forEach(function (param) {
    route.param(param, this.params[param]);
  }, this);

  // register route with router
  this.stack.unshift(route);

  return route;
};

Router.prototype.match = function (path) {
  var layers = this.stack;
  var matched = [];
  var middleware = [];
  var route;
  for (var len = layers.length, i = 0; i < len; i++) {

    if (layers[i].match(path)) {
      middleware.push(layers[i].middleware);
      if(!route){
        route = layers[i];
      }
      matched.push(layers[i]);
    }
  }
  return {
    route: route,
    layers: matched,
    middleware: middleware
  };
};

Router.prototype.use = function(prefix, middleware){
  var router = this;
  var middleware = Array.prototype.slice.call(arguments);
  var path;
  // support array of paths
  if (Array.isArray(middleware[0]) && typeof middleware[0][0] === 'string') {
    middleware[0].forEach(function (p) {
      router.use.apply(router, [p].concat(middleware.slice(1)));
    });
    return this;
  }

  if (typeof middleware[0] === 'string') {
    path = middleware.shift();
  }

  // filter out nested routers from filter
  middleware = middleware.filter(function (fn) {
    if (fn.router) {
      fn.router.stack.forEach(function (layer) {
        if (path) layer.setPrefix(path);
        if (router.opts.prefix) layer.setPrefix(router.opts.prefix);
        router.stack.push(layer);
      });
      if (router.params) {
        Object.keys(router.params).forEach(function (key) {
          fn.router.param(key, router.params[key]);
        });
      }
      return false;
    }
    return true;
  });

  if (middleware.length) {
    router.register(path || '(.*)', [], middleware);
  }

  return this;
}

Router.prototype.routes = function () {
  var router = this;

  var dispatch = function *dispatch(next) {
    var path = this.path;
    var matched = router.match(path);

    this.matched = matched.layers;

    if (matched.route) {
      this.route = matched.route;
      this.captures = this.route.captures(path, this.captures);
      this.params = this.route.params(path, this.captures, this.params);

      next = matched.route.middleware.call(this, next);

      for (var i = 0, l = matched.middleware.length; i < l; i++) {
        next = matched.middleware[i].call(this, next);
      }
    }
    yield *next;
  };

  dispatch.router = this;

  return dispatch;
};
