# socket-middleware-router
Router for socket-middleware, like koa-router


```js
var Middleware = require('socket-middleware');
var Router = require('socket-middleware-router');
var http = require('http').createServer().listen(3000);


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

mw.use(router.routes());
mw.use(function*(next){
  //this.send('hi');
  this.body = "sdsds";
  yield next;
});

mw.attach(http);
```
