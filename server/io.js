const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

let io;

const handleLike = async (socket, id) => {
  let len;

  try {
    console.log(id);
    const doc = await Message.findById(id);
    console.log(doc);

    if (doc.usersLiked.includes(socket.request.session.account._id)) {
      const newArray = doc.usersLiked.filter((user) => user !== socket.request.session.account._id);
      doc.usersLiked = newArray;
    } else {
      doc.usersLiked.push(socket.request.session.account._id);
    }
    await doc.save();

    len = doc.usersLiked.length;

    console.log(`${doc.usersLiked.length} success`);
  } catch (err) {
    console.log(err);
  }

  socket.rooms.forEach((room) => {
    if (room === socket.id) return;

    const likeData = {
      likeCount: len,
      messageId: id,
    };

    io.to(room).emit('like post', likeData);
  });
};

const handleChatMessage = async (socket, msg) => {
  let holder;

  const messageData = {
    content: msg,
    sender: socket.request.session.account._id,
    username: socket.request.session.account.username,
  };

  try {
    const newMessage = new Message(messageData);
    holder = newMessage._id;
    await newMessage.save();
  } catch (err) {
    console.log(err);
  }

  console.log(holder);

  socket.rooms.forEach((room) => {
    if (room === socket.id) return;
    const fullMsg = {
      username: socket.request.session.account.username,
      sender: socket.request.session.account._id,
      content: msg,
      likeCount: 0,
      isOwnPost: true,
      _id: holder
    };
    console.log("sending");

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
    socket.on('like post', (id) => handleLike(socket, id));
    socket.on('room change', (room) => handleRoomChange(socket, room));
  });

  return server;
};

module.exports = socketSetup;
