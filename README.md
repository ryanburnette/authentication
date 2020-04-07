# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A Node.js authentication library.

## About

Back when I used Ruby on Rails, I loved how quickly I could build an app with
user-friendly authentication using
[Devise](https://github.com/heartcombo/devise). There are similar options for
Node.js and Express, but none of them met my needs, so I wrote this.

> This library is not a suggestion of the right way to do anything, or advice on
> how you should do something. It's just how I do it on some of the apps I work
> on.

You give this library some options, and it gives you what you need for a basic
authentication strategy.

## API

- `users([email])` Get an array of the user objects. Include an optional email
  address argument to get a single user.
- `sessions([email])` Get an array of the session objects. A session basically
  just an unexpired token, but it also keeps track of the `ip` and `ua` of the
  browser that got the token. Include an email address as the argument to get
  the sessions for that user.
- `signin(email)` Start the authentication process. Email the user an
  exchangeToken that they'll trade for their token.
- `signout(token|id)` Sign a session out.
- `exchange(exchangeToken)` Complete the authentication process. Exhcange an
  exchagneToken for a token.
- `authorize(req, res, next)` Express middleware for authorizing requests.
  Requests should set `Authorization: Bearer [token]`. If the request isn't
  authorized, return 401.

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
```

## Limitations

- This is meant for apps with a small number of users.
- This isn't meant to be the most secure implementation ever. If it's good
  enough, it's good enough. If it's not, use something else.
