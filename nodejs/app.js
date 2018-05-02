var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var serialport = require('serialport');
var readline = require('readline');

var portname = "COM5";

var myPort = new serialport(portname, {
    baudRate: 9600
});

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
myPort.on('open', onOpen);
myPort.on('data', onrecieveData);
myPort.on('error', showError)
rl.on('line', sendData);

function onOpen()
{
    console.log("open connection");
}

function onrecieveData(data)
{
    console.log("Received data: " + data);
}

function sendData(data)
{
    console.log("sending to serial: " + data);
    myPort.write(data + "\n");
}

function showError(error)
{
    console.log('Serial port error: ' + error);
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;