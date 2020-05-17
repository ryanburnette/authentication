# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A really simple Node.js Authentication library.

## About

This library is not a suggestion of the right way to do anything, or advice on
how you should do something. It's just how I start out doing authentication on
some of the apps I build.

## Configuration

Configuration options may or may not be documented. Read the source too.

- `name` **required** The name of the app.
- `domain` **required** Domain of the app.
- `env` Emails are not sent in `development`. Defaults to `development`.
- `users` **required** Provide an Array of user objects, or an object with a
  `all()` and `find()` async functions that attaches to the database.
- `email` Optionally override the built-in mailgun email function.
- `mailgunApiKey` **required** Required if using the default emailer.
- `mailgunDomain` If different from `opts.domain`.
- `signinTimeout` Time in milliseconds for a sign in request to expire. Defaults
  to 10 minutes.
- `sessionTimeout` Time in milliseconds for a session to expire. Sessions won't
  expire unless this is provided.
- `storage` Session storage plugin. If not provided, will use built-in file
  system storage. Write your own to use a database or other storage for the
  sessions.
- `dir` If using built-in storage, this is the directory to keep the session
  details in. Defaults to `./authentication/`.

## API

Async functions provided by the returned object that are used in an
implementation.

- `signin(email)` Start the sign in process. Email the user a signinToken.
  Resolves the resulting session and email object from mailgun, if using
  built-in email and not in development environment.
- `exchange(signinToken)` Complete the sign in process. Exchange a signinToken
  for an authorizationToken. Resolves the session and user.
- `verify(authorizationToken)` Verify an authorizationToken. Resolves the
  session and user. Throws errors for all failures. Catch!
- `signout(token)` Destroy the session associated with this token.
