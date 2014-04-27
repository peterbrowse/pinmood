//Console Colours
var	blue  		= '\033[34m',
	green 		= '\033[32m',
	red   		= '\033[31m',
	yellow 		= '\033[33m',
	purple		= '\033[35m',
	reset 		= '\033[0m';
	
//Dependencies
var express 				= require('express')
,	MongoStore				= require('connect-mongo')(express)
,	http 					= require('http')
,	app 					= express()
,	server 					= http.createServer(app)
,	sass					= require('node-sass')
,	jade					= require('jade')
,	fs						= require("fs")	
,	passport 				= require('passport')
,	util 					= require('util')
, 	mongoose 				= require('mongoose')
,	flash					= require('connect-flash');

//DB Setup
mongoose.connect('mongodb://pinmood_admin:pinmood_db_2014@oceanic.mongohq.com:10008/pinmood_sessions');
	
var conf = {
	db: {
		db: 'pinmood_sessions',
		host: 'oceanic.mongohq.com',
		port: 10008,
		username: 'pinmood_admin',
		password: 'pinmood_db_2014',
		collection: 'sessions',
		auto_reconnect: true
	},
	secret: 'the cat'
}

var Schema = mongoose.Schema

var db = mongoose.connection;
db.on('error', console.error.bind(console, red+'errr:'+reset));
db.once('open', function callback() {
	console.log(green+'info: '+reset+'Database connection established.');
});

//Express Environment Configuration
app.configure('development', function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(sass.middleware({
		src: __dirname + '/sass',
		dest: __dirname + '/public',
		debug: true,
		outputStyle: 'compressed'
	}));
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	app.use(express.logger());
	app.use(express.favicon(__dirname + '/public/images/favicon.ico', { maxAge: 2592000000 }));
	app.use(express.cookieParser());
	app.use(express.session({
    	secret: conf.secret,
    	cookie: {maxAge: 432000000},
    	store: new MongoStore(conf.db, function () {
    		console.log(green+'info: '+reset+'Session database connection established.');
  		})
  	}));
  	app.use(passport.initialize());
  	app.use(passport.session());
  	app.use(express.json());
	app.use(express.urlencoded());
	app.use(flash());
  	app.use(app.router);
  	app.locals.moment = require('moment');
  	app.use(function(req, res, next){
		res.status(404);
		if (req.accepts('html')) {
			res.render('404', {
				url: req.url
			});
			return;
		}
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}
		res.type('txt').send('Not found');
	});
});

app.configure('production', function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(sass.middleware({
		src: __dirname + '/sass',
		dest: __dirname + '/public',
		debug: false,
		outputStyle: 'compressed'
	}));
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler());
	app.use(express.favicon(__dirname + '/public/images/favicon.ico', { maxAge: 2592000000 }));
	app.use(express.cookieParser());
	app.use(express.session({
    	secret: conf.secret,
    	cookie: {maxAge: 432000000},
    	store: new MongoStore(conf.db, function () {})
  	}));
  	app.use(passport.initialize());
  	app.use(passport.session());
  	app.use(express.json());
	app.use(express.urlencoded());
	app.use(flash());
  	app.use(app.router);
  	app.locals.moment = require('moment');
  	app.use(function(req, res, next){
		res.status(404);
		if (req.accepts('html')) {
			res.render('404', {
				url: req.url
			});
			return;
		}
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}
		res.type('txt').send('Not found');
	});
});

//Server Listen Declaration
server.listen(process.env.PORT || 8080, function (err) {
	if (err) {
		console.log(red+'errr: '+reset+ JSON.stringify(err));
	} else {
		console.log(green+'info: '+reset+'Express server started on '+yellow+'%s:'+yellow+'%s'+reset+'.', server.address().address, server.address().port);
		console.log(green+'info: '+reset+'App running in '+yellow+process.env.NODE_ENV+reset+' mode.');
	}
});