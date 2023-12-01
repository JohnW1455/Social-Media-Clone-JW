const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

let io;

const handleChatMessage = async (socket, msg) => {
  const messageData = {
    content: msg,
    sender: socket.request.session.account._id,
    username: socket.request.session.account.username,
  };

  try {
    const newMessage = new Message(messageData);
    await newMessage.save();
  } catch (err) {
    console.log(err);
  }

  socket.rooms.forEach((room) => {
    if (room === socket.id) return;
    const fullMsg = {
      username: socket.request.session.account.username,
      content: msg,
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
