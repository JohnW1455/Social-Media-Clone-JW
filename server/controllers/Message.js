const models = require('../models');

const { Message } = models;

const makerPage = async (req, res) => res.render('app');

const getMessages = async (req, res) => {
  try {
    const docs = await Message.find().select('username content').sort({ date: -1 }).lean()
      .exec();

    return res.json({ messages: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving messages' });
  }
};

const saveMessage = async (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({ error: 'Text content is required!' });
  }

  const messageData = {
    content: req.body.text,
    sender: req.session.account._id,
    username: req.session.account.username,
  };

  try {
    const newMessage = new Message(messageData);
    await newMessage.save();
    return res.status(201);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured making domo!' });
  }
};

module.exports = {
  makerPage,
  getMessages,
  saveMessage,
};
