# @ryanburnette/authentication

A Node.js authentication library.

## What this library does

You give this library some options, a list of users, and Mailgun credentials.

You get back a few functions:

- `users` Get an array of the user objects. Include an email address as the
  argument to get a single user.
- `sessions` Get an array of the session objects. A session is just an unexpired
  token, but it also keeps track of the `ip` and `ua` of the requesting browser.
  Include an email address as the argument to get the sessions for that user.
- `request` A function to allow users to request a token by email.
- `authorize` Express middleware for authorizing requests. Requests should pass
  the token as `Authorization: Bearer [token]`. If the request isn't authorized,
  it receives a 401 status.

## Usage

```
npm install @ryanburnette/authentication
```

```js
var authentication = require('@ryanburnette/authentication')({
  app: {
    name: 'my-app',
    email: 'no-reply@ryanburnette.com'
  },
  users: [
    {
      name: 'Ryan Burnette',
      email: 'ryan.burnette@gmail.com'
    }
  ],
  mailgun: {
    apiKey: '',
    domain: ''
  },
  storage: require('@ryanburnette/authentication-storage-fs')
});

app.get('/request', function (req, res) {
  var email = req.body;
  var user = authentication.users(email);
  if (user) {
    authentication.request(user.email);
  }
  res.sendStatus(200);
});

app.get('/me', authentication.authorize, function (req, res) {
  res.json(req.user);
});

app.get('/me/sessions', authentication.authorize, function (req, res) {
  var sessions = authentication.sessions.filter(function (el) {
    return el.email == req.user.email;
  });
  res.json(sessions);
});
```

## Limitations

- This is meant for apps with a small number of users.
- This isn't meant to be the most secure implementation ever. If it's good
  enough, it's good enough. If it's not, use something else.
