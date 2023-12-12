const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// arbitrary number to make sure password 
// hashes are more complicated
const saltRounds = 10;

let AccountModel = {};

// account schema aka what an account should look like in the DB
// accounts have a username, a password, a premium status,
// a list of users they follow and a date of creation
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  password: {
    type: String,
    required: true,
  },
  premium: {
    type: Boolean,
    default: false,
  },
  followedUsers: {
    type: Array,
    default: [],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Converts doc to something we can store in redis later on
AccountSchema.statics.toAPI = (doc) => ({
  username: doc.username,
  _id: doc._id,
  premium: doc.premium,
});

// Helper function to hash a password
AccountSchema.statics.generateHash = (password) => bcrypt.hash(password, saltRounds);

// uses bcrypt wizardry to make sure accounts in the 
// database match what a user inputs when the log in
AccountSchema.statics.authenticate = async (username, password, callback) => {
  try {
    const doc = await AccountModel.findOne({ username }).exec();
    if (!doc) {
      return callback();
    }

    const match = await bcrypt.compare(password, doc.password);
    if (match) {
      return callback(null, doc);
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
};

AccountModel = mongoose.model('Account', AccountSchema);
module.exports = AccountModel;
