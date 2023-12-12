const models = require('../models');

const { Message } = models;
const { Account } = models;

// displays the main app page when requested
const makerPage = async (req, res) => res.render('app');

// gets messages from the DB for users and performs
// a fun sort function on them while adding
// extra fields for other purposes
const getMessages = async (req, res) => {
  console.log('getting messages');
  try {
    // grabs account of user
    const account = await Account.findById(req.session.account._id);

    if (!account) {
      return res.status(500).json({ error: 'Error retrieving messages' });
    }

    // aggregate search allows of a very precise look into database
    const posts = await Message.aggregate([
      {
        // add extra fields to data for things used
        // in other places of the server and app
        $addFields: {
          // bool for whether the message is from
          // an account the user follows
          isFollowed: {
            $cond: {
              if: { $in: ['$sender', account.followedUsers] },
              then: true,
              else: false,
            },
          },
          // for display purposes
          likeCount: { $size: '$usersLiked' },
          // for displaying the follow button in the app
          // for posts from people who aren't the user
          isOwnPost: {
            $cond: {
              if: { $eq: [{ $toString: '$sender' }, req.session.account._id] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        // displays messages based on following criteria
        // 1. Followed account with high likes
        // 2. Followed account with low likes
        // 3. Non-Followed account with high likes
        // 4. Non-Followed account with low likes
        $sort: {
          isFollowed: -1,
          likeCount: -1,
        },
      },
    ]);

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving messages' });
  }
};

module.exports = {
  makerPage,
  getMessages,
};
