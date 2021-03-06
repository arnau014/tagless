var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Sequelize = require('sequelize');
var models = require('./config/models');
var session = require ('express-session');
var sequelizeConnection = require("./config/sequelizeConnection");
var FileStore = require('session-file-store')(session);
var sm = require('sitemap')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var threadRouter = require('./routes/thread');
var commentsRouter = require('./routes/comments');
var searchRouter = require('./routes/search');
var APIRouter = require('./API/API-file');
var device = require('express-device');

var app = express();

sitemap = sm.createSitemap ({
    hostname: 'http://tagless.moe',
    cacheTime: 600000,  // 600 sec cache period
    urls: [
        { url: '/',  changefreq: 'hourly',  priority: 1 },
        { url: '/users/signup', changefreq: 'never', priority: 0.6 }
    ]
});

var sequelize = sequelizeConnection.sequelize; //instance to query

const mapElastic = require('./config/elasticsearch/elasticsearchMain');
mapElastic.mapElasticsearch();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    store: new FileStore(),
    key: 'user_sid',
    secret: '%_i_love_enginyeria_software',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60*60*24*7,
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    console.log("Cookie user_sid "+ req.cookies.user_sid);
    console.log("Req Session user "+ req.session.user);
    res.locals.is_logged = false;
    if (req.cookies.user_sid){
        if (!req.session.user){
            console.log("Clear cookie");
            res.clearCookie('user_sid');
        }else{
            res.locals.is_logged = true;
            res.locals.logged_username = req.session.user;
        }
    }
    console.log(res.locals.is_logged);
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/search', searchRouter);
app.use('/c/', threadRouter);
app.use('/static', express.static('public'));
app.use('/static/open-iconic', express.static('node_modules/open-iconic'));
app.use('/static/npm/datatables', express.static('node_modules/datatables'));
app.use('/static/npm/typeahead', express.static('node_modules/typeahead.js'));
app.use('/API', APIRouter);
app.use(device.capture());

app.get('/sitemap.xml', function(req, res) {
    res.header('Content-Type', 'application/xml');
    res.send( sitemap.toString() );
});


//test
app.use('/comments', commentsRouter);

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
