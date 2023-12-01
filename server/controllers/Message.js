const models = require('../models');

const { Message } = models;

const makerPage = async (req, res) => res.render('app');

const getMessages = async (req, res) => {
  try {
    const docs = await Message.find().select('username content').sort({ createdDate: -1}).lean()
      .exec();

    return res.json(docs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving messages' });
  }
};



module.exports = {
  makerPage,
  getMessages,
};
