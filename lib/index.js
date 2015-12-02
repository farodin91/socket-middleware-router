
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

Router.prototype.use = function(middleware){
  var router = this;
  router.request('(.*)', [], middleware);
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
