# @ryanburnette/authentication

A Node.js authentication library.

## What this library does

You give this library some options, a list of users, and Mailgun credentials.

You get back a few functions:

- `findUser` A function to find a user by email address.
- `request` A function to allow users to request a token by email.
- `authorize` Express middleware for authorizing requests. Requests should pass
  the token as `Authorization: Bearer [token]`. If the request isn't authorized,
  the requests receives a 401 status.

You can also see the data:

- `users`
- `sessions`

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
  var user = authentication.findUser(req.body);

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
