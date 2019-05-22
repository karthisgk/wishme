
var socket  = require( 'socket.io' );
var express = require('express');
var session = require('express-session');
var Routes = require('./routes');
var ServerSocket = require('./ServerSocket');
var appConfig = require('./config').initApp(__dirname);
var config = appConfig[process.env.NODE_ENV || 'development'];
var bodyParser = require('body-parser');

var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(session({
  secret: "mysqc",
  name: "mycookie",
  resave: true,
  proxy: true,
  saveUninitialized: true,
  duration: appConfig.session_time,
  activeDuration: appConfig.session_time,
  httpOnly: true,
  secure: true,
  ephemeral: true,
  cookie: {
    secure: false,
    maxAge: appConfig.session_time
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', 'http://bday.karthisgk.be');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,token');
    next();
});

var router = new Routes(express.Router());
app.use(router.r);

var server  = require('http').createServer(app);
var io = socket.listen(server);
var sv = new ServerSocket(io);

server.listen(config.port, '127.0.0.1');
console.log("server listening at "+config.port);


