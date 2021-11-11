var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Flatted = require('flatted');
const axios = require('axios');
const protobuf = require('protobufjs');
var bodyParser = require('body-parser');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');


var app = express();

app.use(bodyParser.text());

run().catch(err => console.log(err));

async function run() {
  const root = await protobuf.load('user.proto');

  const doc = { name: 'Bill', age: 30 };
  const User = root.lookupType('userpackage.User');

  app.get('/user', function(req, res) {
    // console.log('getUser', {req, res});
    console.log('encode', User.encode(doc).finish());
    res.send(User.encode(doc).finish());
  });

  // express.text({ type: '*/*' })

  app.post('/', express.text({ type: '*/*' }), function(req, res) {
    // Assume `req.body` contains the protobuf as a utf8-encoded string
    console.log("POST REQ", req);
    console.log('Req', req.body);
    const user = User.decode(Buffer.from(req.body));
    Object.assign(doc, user);
    res.end();
  });

  await app.listen(3000);

  let data = await axios.get('http://localhost:3000/user').then(res => res.data);
  console.log("1 Data", data);
  // "Before POST User { name: 'Bill', age: 30 }"
  console.log('Before POST', User.decode(Buffer.from(data)));
  const postBody = User.encode({ name: 'Joeel', age: 27 }).finish();
  console.log('postBody', postBody);
  if (postBody) {
    console.log('>', postBody);

    await axios.post('http://localhost:3000', postBody).
      then(res => res.data);

    await axios.post('https://control.ocore.io/Interconnect', postBody).
      then(res => res.data);

    data = await axios.get('http://localhost:3000/user').then(res => res.data);
    // "After POST User { name: 'Joe', age: 27 }"
    console.log('After POST', User.decode(Buffer.from(data)));
  }
}


// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);


// app.post('/', function (req, res) {
//   console.log("REQ POST", req);
//   console.log("REQ STRING", Flatted.stringify(req));
//   res.send('POST request to the homepage');
// });

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });




// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
