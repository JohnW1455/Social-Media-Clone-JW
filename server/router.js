const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getMessages', mid.requiresLogin, controllers.Message.getMessages);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.post('/changePass', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePass);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Message.makerPage);

  app.get('/isPremium', mid.requiresLogin, controllers.Account.getPremium);
  app.post('/setPremium', mid.requiresLogin, controllers.Account.setPremium);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
