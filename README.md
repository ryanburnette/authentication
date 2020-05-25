# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A really simple Node.js Authentication library.

## About

This library is not a suggestion of the right way to do anything, or advice on
how you should do something. It's just how I start out doing authentication on
some of the apps I build.

## Configuration

### Core

- `users` **required** Provide an Array of user objects. If you have users in a
  database, or a custom implementation, take a look at `users.js`. The default
  implementation is just providing two async functions, `all()` and
  `find(email)`. Provide an object with the expected functions and behavior to
  use your existing user database.
- `signinTimeout` Time in milliseconds for a sign in request to expire. This is
  the time from when a user initiates the sign in process until they must
  complete it to avoid the sign in epxiring. Defaults to 10 minutes.
- `sessionTimeout` Time in milliseconds for a session to expire. This is how
  long a token is valid for beginning with when it was issued. Sessions won't
  expire unless this is provided.

### Sessions

- `dir` If using built-in sessions, this is the directory to keep the session
  details in. Defaults to `./.authentication/`.
- `sessions` If built-in sessions is not to be used, override it by providing an
  object here. Take a look at `sessions-fs.js` to see what functions must be
  present and how they should behave.

### Email Sending

- `name` **required** The name of the app.
- `env` Emails are not sent in `development`. Defaults to `development`.
- `domain` **required** Domain of the app.
- `mailgunApiKey` **required** Required if using the default emailer.
- `mailgunDomain` If different from `opts.domain`.
- `mailgun` If you already have a mailgunjs instance, pass it here.
  `mailgunApiKey` will no longer be required.
- `email` Override the built-in email function. None of the normally required
  options are still required if you override the email function. See `email.js`
  to write your own.

## Tokens

- `signinToken` A shorter token that's generated when a user starts the sign in
  process. This will also serve as the session identifer.
- `authorizationToken` A longer token that is generated when a user claims their
  token.
- `token` The token used for authentication.

## API

Async functions provided by the returned object that are used in an
implementation.

- `signin({ email, attrs })` Start the sign in process. Email the user a
  signinToken. Resolves the resulting session and email object from mailgun, if
  using built-in email and not in development environment.
- `exchange({ signinToken, attrs })` Complete the sign in process. Exchange a
  signinToken for an authorizationToken. Resolves the session and user.
- `verify(token)` Verify a token. Resolves the session and user. Throws errors
  for all failures. Catch!
- `signout(signinToken)` Destroy the session associated with this token.
