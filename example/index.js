'use strict';

require('dotenv')({});

var express = require('express');
var Authentication = require('@ryanburnette/authentication');

var app = express();

var config = {
  users: [
    {
      name: 'Ryan Burnette',
      email: 'ryan.burnette@gmail.com'
    }
  ],
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  },
  email: {
    from: 'no-reply@localhost',
    to: '<%= user.name %> <<%= user.email %>>',
    subject: 'Sign in to My App <%= uuid %>',
    html: fs.readFileSync('./email.html', 'utf8'),
    text: fs.readFileSync('./email.txt', 'utf8')
  },
  storage: require('@ryanburnette/authentication-storage-fs')
};

var authentication = Authentication(config);

app.get('/signin', function(req, res) {
  var email = req.body;
  authentication
    .users(email)
    .then(function(user) {
      if (user) {
        authentication.signin(user.email);
      }
    })
    .catch(function(err) {
      console.error(err);
    });
  res.sendStatus(200);
});

app.get('/exchange', function(req, res) {
  var exchangeToken = req.body;
  authentication
    .exchange(exchangeToken)
    .then(function(token) {
      if (token) {
        res.send(token);
      } else {
        res.sendStatus(401);
      }
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500);
    });
});

app.get('/user', authentication.authorize, function(req, res) {
  res.json(req.user);
});

app.get('/sessions', authentication.authorize, function(req, res) {
  authentication
    .sessions(req.user.email)
    .then(function(sessions) {
      res.json(sessions);
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500);
    });
});

app.get('/signout', authentication.authorize, function(req, res) {
  authentication
    .signout({ token: req.token })
    .then(function() {
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500);
    });
});
