
var chalk = require('chalk');
var humanize = require('humanize-number');
var bytes = require('bytes');
var colorCodes = {
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green'
};

module.exports = dev;

function dev(opts) {
  return function *logger(next) {
    var start = new Date;
    console.log('  ' + chalk.gray('<--')  + ' ' + chalk.bold('%s')  + ' ' + chalk.gray('%s'), "WEBSOCKET", this.path);
    try {
      yield next;
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.

    // log when the response is finished or closed,
    // whichever happens first.
    var ctx = this;

    var onend = done.bind(null, 'end');

    ctx.once('end', onend);

    function done(event){
      ctx.removeListener('end', onend);
      log(ctx, start, null, event);
    }
  }
}
function log(ctx, start, err, event) {
  // get the status code of the response
  var status = err
    ? (err.status || 500)
    : (ctx.status || 404);

  // set the color of the status code;
  var s = status / 100 | 0;
  var color = colorCodes[s];

  // get the human readable response length
  var length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (null == ctx.body) {
    length = '-';
  } else {
    length = bytes(Buffer.byteLength(ctx.body));
  }

  var upstream = err ? chalk.red('xxx')
    : event === 'close' ? chalk.yellow('-x-')
    : chalk.gray('-->')

  console.log('  ' + upstream
    + ' ' + chalk.bold('%s')
    + ' ' + chalk.gray('%s')
    + ' ' + chalk[color]('%s')
    + ' ' + chalk.gray('%s')
    + ' ' + chalk.gray('%s'),
      "WEBSOCKET",
      ctx.path,
      status,
      time(start),
      length);
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time(start) {
  var delta = new Date - start;
  delta = delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's';
  return humanize(delta);
}
