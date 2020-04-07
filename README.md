# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A Node.js authentication library.

## What this library does

You give this library some options, a list of users, and Mailgun credentials.

You get back a few functions:

- `users` Get an array of the user objects. Include an email address as the
  argument to get a single user.
- `sessions` Get an array of the session objects. A session is just an unexpired
  token, but it also keeps track of the `ip` and `ua` of the requesting browser.
  Include an email address as the argument to get the sessions for that user.
- `authenticate` A function to allow users to authenticate by having a token
  sent to their email address.
- `authorize` Express middleware for authorizing requests. Requests should pass
  the token as `Authorization: Bearer [token]`. If the request isn't authorized,
  it receives a 401 status.

## Usage

```
npm install @ryanburnette/authentication
```

```js
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

app.get('/authenticate', function (req, res) {
  var email = req.body;
  authentication
    .users(email)
    .then(function (user) {
      if (user) {
        authentication.authenticate(user.email);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
  res.sendStatus(200);
});

app.get('/me', authentication.authorize, function (req, res) {
  res.json(req.user);
});

app.get('/me/sessions', authentication.authorize, function (req, res) {
  authentication.sessions(req.user.email).then(function (sessions) {
    res.json(sessions);
  });
});
```

## Limitations

- This is meant for apps with a small number of users.
- This isn't meant to be the most secure implementation ever. If it's good
  enough, it's good enough. If it's not, use something else.
