const mongoose = require('mongoose');
const _ = require('underscore');

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
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

const MessageModel = mongoose.model('Message', MessageSchema);
module.exports = MessageModel;