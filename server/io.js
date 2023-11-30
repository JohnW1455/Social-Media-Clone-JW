const http = require('http');
const { Server } = require('socket.io');

let io;

const handleChatMessage = (socket, msg) => {
  socket.rooms.forEach((room) => {
    if (room === socket.id) return;
    const fullMsg = {
      username: socket.request.session.account.username,
      text: msg,
    };

    io.to(room).emit('chat message', fullMsg);
  });
};

const handleRoomChange = (socket, roomName) => {
  socket.rooms.forEach((room) => {
    if (room === socket.id) return;
    socket.leave(room);
  });
  socket.join(roomName);
};

const socketSetup = (app, middleware) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.engine.use(middleware);

  io.on('connection', (socket) => {
    console.log('user connected');
    socket.join('general');

    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });

    socket.on('chat message', (msg) => handleChatMessage(socket, msg));
    socket.on('room change', (room) => handleRoomChange(socket, room));
  });

  return server;
};

module.exports = socketSetup;
