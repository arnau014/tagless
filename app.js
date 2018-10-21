var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Sequelize = require('sequelize');
var models = require('./config/models')
var sequelizeConnection = require("./config/sequelizeConnection");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postRouter = require('./routes/post');

var app = express();
var mod = models();
var sequelize = sequelizeConnection.sequelize; //instance to query

//test ----
const User = sequelize.define('User',{
  userId : Sequelize.INTEGER,
  email: Sequelize.STRING,
  username: Sequelize.STRING,
  pass: Sequelize.STRING,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
})

sequelize.query('SELECT * FROM Users')
    .then(user => console.log(user));


var data = User.findAll({
    attributes: ['username', 'pass']});

console.log(data.valueOf());

//test ----

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/post', postRouter);
app.use('/static', express.static('public'));

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
