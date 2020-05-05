require('dotenv').config({});

module.exports = require('../')({
  app: '@ryanburnette/authentication',
  domain: process.env.MAILGUN_DOMAIN,
  users: [{ email: 'ryan.burnette@gmail.com', role: 'administrator' }],
  secret: 'secret',
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  env: 'production'
});
