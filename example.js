'use strict';

var express = require('express');
var Authentication = require('@ryanburnette/authentication');

var authentication = {
  users: [
    {
      name: 'Ryan Burnette',
      email: 'ryan.burnette@gmail.com'
    }
  ],
  email: {
    mailgun: {
      apiKey: '',
      domain: ''
    },
    signin: {
      subject: 'Sign in to my app',
      html:
        '<p>Sign in to my app.</p><p><a href="<%= url %>">Click here</a></p>',
      text: ''
    }
  },
  storage: require('@ryanburnette/authentication-storage-fs')
};

app.get('/signin', function (req, res) {
  var email = req.body;
  authentication
    .users(email)
    .then(function (user) {
      if (user) {
        authentication.signin(user.email);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
  res.sendStatus(200);
});

app.get('/exchange', function (req, res) {
  var exchangeToken = req.body;
  authentication
    .exchange(exchangeToken)
    .then(function (token) {
      if (token) {
        res.send(token);
      } else {
        res.sendStatus(401);
      }
    })
    .catch(function (err) {
      console.error(err);
      res.sendStatus(500);
    });
});

app.get('/user', authentication.authorize, function (req, res) {
  res.json(req.user);
});

app.get('/sessions', authentication.authorize, function (req, res) {
  authentication
    .sessions(req.user.email)
    .then(function (sessions) {
      res.json(sessions);
    })
    .catch(function (err) {
      console.error(err);
      res.sendStatus(500);
    });
});

app.get('/signout', authentication.authorize, function (req, res) {
  authentication
    .signout(req.token)
    .then(function () {
      res.sendStatus(200);
    })
    .catch(function (err) {
      console.error(err);
      res.sendStatus(500);
    });
});
