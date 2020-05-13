# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A really simple, not for production, Node.js Authentication library.

## About

This library is not a suggestion of the right way to do anything, or advice on
how you should do something. It's just how I start out on some of the apps I
work on. I use this when I need to rapidly get a prototype out for beta testing.

If you're thinking about using this on your production app, don't.

## Configuration

- `name` **required** The name of the app.
- `domain` **required** Domain of the app.
- `users` **required** Provide an array of user objects, or a function that
  resolves a promise into the array of user objects. The only required attribute
  for a user object is `email`. Everything in the user object is encoded into
  the tokens.
- `mailgunApiKey` **required**
- `mailgunDomain` If different from `opts.domain`.
- `secret` Randomly generated if not provided.
- `signinTimeout` Time in milliseconds for a sign in request to expire. Defaults
  to 10 minutes.
- `env` In `development` it does not send emails. In `staging` and `production`
  it will. Defaults to `development`.
- `storage` The storage library. If not provided, will use `storage-fs.js`.
  Write your own to use a database or other storage for the sessions.
- `dir` The directory to keep the session details in. Defaults to
  `./authentication/`. Only relevant if ussing `storage-fs.js`.

## API

Functions provided by the returned object that are used in an implementation.
All functions return promises.

- `signin(email)` Start the sign in process. Email the user a jti.
- `exchange(jti)` Complete the sign in process. Exchange a jti for a token.
- `verify(token)` Verify a token.
- `signout(token)` Destroy the session associated with this token.
