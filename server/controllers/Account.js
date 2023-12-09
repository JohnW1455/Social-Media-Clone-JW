const models = require('../models');

const { Account } = models;
const { Message } = models;

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields and required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const changePass = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const pass3 = `${req.body.pass3}`;

  if (!username || !pass || !pass2 || !pass3) {
    return res.status(400).json({ error: 'All fields and required!' });
  }

  if (pass2 !== pass3) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  return Account.authenticate(username, pass, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    const hash = await Account.generateHash(pass2);
    const accountVar = account;
    accountVar.password = hash;

    await account.save();
    req.session.account = Account.toAPI(account);

    req.session.destroy();
    return res.json({ redirect: '/login' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields and required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    // req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/login' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const getPremium = async (req, res) => {
  const doc = await Account.findById(req.session.account._id).select('premium').exec();
  return res.status(200).json(doc);
};

const setPremium = async (req, res) => {
  try {
    const doc = await Account.findById(req.session.account._id);
    doc.premium = !doc.premium;
    await doc.save();
    req.session.account = Account.toAPI(doc);
    return res.status(200);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const addFollowed = async (req, res) => {
  try {
    console.log(req.body.id);
    const doc = await Message.findById(req.body.id);
    console.log(doc);
    const accSender = await Account.findById(doc.sender);
    console.log(accSender);
    const follower = await Account.findById(req.session.account._id);
    console.log(follower);

    if (req.session.account.followedUsers.includes(accSender._id)) {
      const newArray = req.session.account.followedUsers.filter((user) => user !== accSender._id);
      req.session.account.followedUsers = newArray;
    } else {
      req.session.account.followedUsers.push(accSender._id);
    }
    await doc.save();

    console.log(`${req.session.account.followedUsers.length} success`);
    return res.status(200).json({ message: 'all good!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured!' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  changePass,
  getPremium,
  setPremium,
  addFollowed,
};
