# socket-middleware-router
Router for socket-middleware, like koa-router


```js
var Middleware = require('socket-middleware');
var Router = require('socket-middleware-router');
var http = require('http').createServer().listen(3000);

var mv = new Middleware();

var router = new Router();

router.request('init', function*(next){
  this.send('init');
});

router.request('init/:id', function*(next){
  this.send('init');
});

mv.use(router.routes());

mv.use(function*(next){
  this.send('hi');
  yield next;
});

mv.attach(http);
```
