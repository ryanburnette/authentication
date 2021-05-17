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

Configure these options if you are using the built-in email function
`lib/email.js`.

- `name` **required** The name of the app.
- `env` Emails are not sent in `development`. Defaults to `development`.
- `domain` **required** Domain of the app.
- `proto` The protocol of the app. Used by the built-in email delivery function
  to create `signinLink`.

These options are passed directly to Nodemailer, so take a look at those docs if
you're using the built-in email delivery function.

- `smtp` **required** Nodemailer options
- `smtp.host` **required** SMTP host
- `smtp.port` SMTP port
- `smtp.secure` SMTP secure (boolean)
- `smtp.user` SMTP user
- `smtp.pass` SMTP pass

Or pass in your own email function as `opts.email`.

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
  signinToken.
- `exchange({ signinToken, attrs, [session] })` Complete the sign in process.
  Exchange a signinToken for an authorizationToken. Resolves the session and
  user. Sometimes you're doing things that require looking up the session before
  you exchange. If you already have the session, you can pass it along.
- `verify(token)` Verify a token. Resolves the session and user. Throws errors
  for all failures. Catch!
- `signout(signinToken)` Destroy the session associated with this token.

## Error Codes

This library will throw these error codes. Watch for them and reveal to the
client what you choose to.

- `ERR_USER_NOT_FOUND` User not found.
- `ERR_SIGNIN_EXPIRED` Sign In expired.
- `ERR_SESSION_EXPIRED` Session expired.
- `ERR_SESSION_NOT_FOUND` Session not found.
- `ERR_SESSION_CLAIMED` Session already claimed.
- `ERR_INVALID_TOKEN` Invalid token.
- `ERR_NOT_CLAIMED` This session was never claimed. We should never get this
  error.
