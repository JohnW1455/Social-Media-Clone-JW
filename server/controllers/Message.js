const models = require('../models');

const { Message } = models;
const { Account } = models;

const makerPage = async (req, res) => res.render('app');

const getMessages = async (req, res) => {
  console.log('getting messages');
  try {
    const account = await Account.findById(req.session.account._id);

    if (!account) {
      throw new Error('Account not Found');
    }

    const posts = await Message.aggregate([
      {
        $addFields: {
          isFollowed: {
            $cond: {
              if: { $in: ["$sender", account.followedUsers] },
              then: true,
              else: false
            }
          },
          likeCount: {$size: "$usersLiked"},
          isOwnPost: {
            $cond: {
              if: { $eq: [{$toString: "$sender"}, req.session.account._id] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $sort: {
          isFollowed: -1,
          likeCount: -1
        }
      }
    ]);

    // const docs = await Message.find().select('username content usersLiked').sort({ createdDate: -1 })
    //   .lean()
    //   .exec();

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving messages' });
  }
};

const setLikes = async (req, res) => {
  console.log('setting likes');
  try {
    console.log(req.body.id);
    const doc = await Message.findById(req.body.id);

    console.log(doc);
    if (doc.usersLiked.includes(req.session.account._id)) {
      const newArray = doc.usersLiked.filter((user) => user !== req.session.account._id);
      doc.usersLiked = newArray;
    } else {
      doc.usersLiked.push(req.session.account._id);
    }
    await doc.save();

    console.log(`${doc.usersLiked.length} success`);
    return res.status(200).json({ message: 'all good!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured!' });
  }
};

module.exports = {
  makerPage,
  getMessages,
  setLikes,
};
