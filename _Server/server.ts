import * as express from 'express';
import * as http from 'http';
import * as sio from 'socket.io'

const app = express();
app.use(express.static(__dirname + '/..'));
const server = http.createServer(app);
server.listen(3000);

var players: number = 0;

sio(server).on('connection', function(socket) {

  let id: number;

  socket.on('join', function(message) {
    players++;
    id = players;
    socket.emit('join', id);
  });
  socket.on('cor', function(data) {
    socket.broadcast.emit('cor', data);
    //console.log(`id: ${data.id}, x: ${data.x}, y: ${data.y}`);
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('left', id);
});
});