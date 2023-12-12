const mongoose = require('mongoose');

// message schema aka what a message structure looks like in the DB
// messages have a sender, the username of the sender,
// the content of the message, an array of users that have
// liked the post, and a date of creation
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  usersLiked: {
    type: Array,
    default: [],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const MessageModel = mongoose.model('Message', MessageSchema);
module.exports = MessageModel;
