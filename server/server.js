var app = require('./app');
var config = require('./config');
var socket = require('socket.io');

var port = config.port;

var server = app.listen(port, function () {
  console.log('We got the boogie on port', port);
});

var io = socket(server);

app.use(function (req, res, next) {
  if(req.method !== 'GET') {
    console.log('i am here');
    io.emit('queueChange', {change: true});
  }
});

var masterTime = 0;
var masterClient = [];

io.on('connection', function (socket) {
  if (!masterClient.length) {
    socket.emit('setAdminFlag', {admin: true});
  }

  masterClient.push(socket.id);
  console.log(masterClient.length);

  socket.on('setTime', function (data) {
    masterTime = data.time;
    socket.broadcast.emit('recTime', {time: masterTime});
  });

  socket.on('disconnect', function () {
    if (masterClient[0] === socket.id) {
      masterClient.shift();

      if (masterClient.length) {
        socket.broadcast.to(masterClient[0]).emit('setAdminFlag', {admin: true});
      }
    } else {
      masterClient.splice(masterClient.indexOf(socket.id), 1);
    }
  });

  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', data);
  });
});



