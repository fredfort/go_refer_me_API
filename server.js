var express = require('express');
var app = express();
var http = require('http').Server(app);
//var io = require('socket.io')(http);

app.set('port',process.env.PORT || 3000);

var  users = require('./routes/users'),
    jwt = require('jwt-simple'),
    mongojs = require("mongojs"),
    mongoose = require("mongoose"),
    jwtauth = require('./utils/jwtauth.js');

app.use(express.urlencoded()); 
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With,  Content-Type, x-access-token, x-access-id");
  res.header("Content-Type: application/json");
  console.log('%s %s', req.method, req.url, req.params);
  next();
});

//var uri ="mongodb://localhost:27017";
var uri = "mongodb://go_refer_me:fatcap32@ds059938.mongolab.com:59938";
mongoose.connect(uri+"/go_refer_me");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("connected to go_refer_me");
});


app.post('/user', users.create);
app.post('/user/search',[express.urlencoded(), jwtauth], users.searchByIds);
app.put('/user', [express.urlencoded(), jwtauth], users.update);
app.get('/user', [express.urlencoded(), jwtauth], users.search);
app.get('/companies', [express.urlencoded(), jwtauth], users.getUserCompanies);



// if none of the previous url get called 404 handeling
app.get('*', function(req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

//error Handeling
app.use(function(err, req, res, next) {
  if(err.status !== 404) {
    return next();
  }
  res.status(404);
  res.send(err.message || '** This URL is not valid, please read the documentation **');
});


app.listen(app.get('port'), function(){
  console.log('listening on *:'+app.get('port'));
});