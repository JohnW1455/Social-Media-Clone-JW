const models = require('../models');

const { Account } = models;

// loads the login page when it is requested
const loginPage = (req, res) => res.render('login');

// redirects users back to log in when the log out
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// authenticates user info
// correct info logs them in as the account
// that matches the entered data
const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  // check for if the fields are empty
  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields and required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    // sends user to main app if log in is successful
    return res.json({ redirect: '/maker' });
  });
};

// method that handles changing the password of the user
const changePass = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const pass3 = `${req.body.pass3}`;

  // check to make sure the fields aren't empty
  if (!username || !pass || !pass2 || !pass3) {
    return res.status(400).json({ error: 'All fields and required!' });
  }

  // check to make sure the new password is the same as the retype
  if (pass2 !== pass3) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  // authenticate if the user is legit, if so then set new password
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

// handles creating a new account and saving it into the database
const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // check to make sure the fields aren't empty
  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields and required!' });
  }

  // check to make sure the password is the same as the retype
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  // creates new account if the
  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();

    return res.json({ redirect: '/login' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

// gets the premium status of the user
const getPremium = async (req, res) => {
  const doc = await Account.findById(req.session.account._id).select('premium').exec();
  return res.status(200).json(doc);
};

// sets the premium status of the account in the database
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

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  changePass,
  getPremium,
  setPremium,
};
