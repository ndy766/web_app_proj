var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');//session
var MySQLsession = require('express-mysql-session')(session);//session Store

var DBoption = {
  host:'ndy766.cpaacnjpvo5o.ap-northeast-2.rds.amazonaws.com',
  port:3306,
  user:'ndy766',
  password:'shel45951!',
  database:'webappproj'
};
var sessionStore = new MySQLsession(DBoption);



//router
var index = require('./routes/index');
var users = require('./routes/users');
var member = require('./routes/member');
var login = require('./routes/login');
var calendar = require('./routes/calendar');
var recent = require('./routes/recent');
var chat = require('./routes/chat');
var about = require('./routes/about');

var app = express();

//chatting 관련
http = require('http');
server = http.createServer(app);
io = require('socket.io').listen(server);
server.listen(3001);



// view engine setup
app.set('views', [
  __dirname + '/views',
  __dirname + '/views/member',
  __dirname + '/views/calendar',
  __dirname + '/views/chat',
  __dirname + '/views/about'
]);
app.set('view engine', 'ejs');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//session
app.use( session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store:sessionStore,
  cookie: { maxAge: 60*1000000 } //원래 60*1000
}));


//router
app.use('/', index);
app.use('/users', users);
app.use('/member', member);
app.use('/login', login);
app.use('/calendar', calendar);
app.use('/recent', recent);
app.use('/chat', chat);
app.use('/about', about);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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


//chat 관련 server코드
var usernames = {};
io.sockets.on('connection', function (socket) {

  socket.on('sendchat', function (data) {

    io.sockets.emit('updatechat', socket.username, data);
  });

  socket.on('adduser', function(username){
    if(username == null || username == 'null' || username.trim()=='')  username = '아무개@'+new Date().getTime();

    socket.username = username;
    usernames[username] = username;
    socket.emit('updatechat', 'SERVER', '<font style="color:red">you have connected</font>');
    socket.broadcast.emit('updatechat', 'SERVER', '<font style="color:red">'+username + ' has connected</font>');
    io.sockets.emit('updateusers', usernames);
  });

  // 사용자가 접속을 끊을 경우 처리할 리스너 함수
  socket.on('disconnect', function(){
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatechat', 'SERVER', '<font style="color:red">'+socket.username + ' has disconnected</font>');
  });
});



module.exports = app;
