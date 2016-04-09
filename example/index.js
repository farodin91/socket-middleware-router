
var koa = require('koa');
var app = koa();
var Middleware = require('socket-middleware');
var Router = require('../index');
var koa_static = require('koa-static');
var http = require('http');


var logger = require('./logger.js');


app.use(koa_static('./public/', { index: 'index.html' }));

var mw = new Middleware();
mw.use(logger());
var router = new Router();

router.request('init', function*(next){
  this.body = "init";
});

router.request('init/:id', function*(next){
  console.log(this.params);
  this.body = "init " + this.params["id"];
});
var test = new Router();
test.request('init', function*(next){
  console.log(this.params);
  this.body = "test init";
});
router.use('test/', test.routes());

mw.use(router.routes());


mw.use(function*(next){
  //this.send('hi');
  this.body = "sdsds";
  yield next;
});

var server = http.Server(app.callback()).listen(8000);
mw.attach(server);
console.log("Server is listen on 8000");
