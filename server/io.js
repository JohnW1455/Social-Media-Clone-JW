const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const Account = require('./models/Account');

let io;
// this file is the socket.io set up and functionality file
// socket.io allows for real time events to be shown to
// all users currently using the service

// method that handles the like events from the user
// adds and removes likes from messages then sends
// that data back to the users through socket
const handleLike = async (socket, id) => {
  let len;

  try {
    // finds message in database by its object id
    const doc = await Message.findById(id);

    // if the user has already liked the post and they click
    // like again, they will unlike it
    if (doc.usersLiked.includes(socket.request.session.account._id)) {
      const newArray = doc.usersLiked.filter((user) => user !== socket.request.session.account._id);
      doc.usersLiked = newArray;
    } else {
      // otherwise they will like the post normally
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

    // sends message data back to the client to update
    //  the right message with the new like count
    const likeData = {
      likeCount: len,
      messageId: id,
    };

    io.to(room).emit('like post', likeData);
  });
};

// method that handles when messages are sent by users
// first, stores message data in the DB by creating a new message
// then emits the appropriate data back to users
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

  socket.rooms.forEach((room) => {
    if (room === socket.id) return;
    const fullMsg = {
      username: socket.request.session.account.username,
      sender: socket.request.session.account._id,
      content: msg,
      likeCount: 0,
      // this bool means that accounts of new posts won't
      // be able to be followed until users reload
      // the page. Didn't have time to figure out
      // a solution to this problem
      isOwnPost: true,
      _id: holder,
    };

    io.to(room).emit('chat message', fullMsg);
  });
};

// similar to how likes work
// handles the follow user event
// checks the DB for appropriate data
// then ends that
const handleFollower = async (socket, id) => {
  // assembles this json through the following logic
  const data = {};

  try {
    console.log(id);
    const doc = await Message.findById(id);
    const accSender = await Account.findById(doc.sender);
    const follower = await Account.findById(socket.request.session.account._id);

    data.sender = accSender._id;
    // if the user follows the account already and clicks
    // unfollow, the user will be removed from the followedUser list
    if (follower.followedUsers.includes(accSender._id)) {
      const newArray = follower.followedUsers.filter(
        (user) => user.toString() !== accSender._id.toString(),
      );
      follower.followedUsers = newArray;
      data.followBool = false;
    } else {
      // otherwise they will be added to the followedUser list
      follower.followedUsers.push(accSender._id);
      data.followBool = true;
    }
    await follower.save();
  } catch (err) {
    console.log(err);
  }

  socket.rooms.forEach((room) => {
    if (room === socket.id) return;
    console.log('attemping emit');
    io.to(room).emit('follow user', data);
  });
};

// sets up socket to use session settings
// also sets up the channels and matching methods
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
    socket.on('follow user', (id) => handleFollower(socket, id));
  });

  return server;
};

module.exports = socketSetup;
