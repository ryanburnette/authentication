# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A Node.js authentication library.

## About

This library is not a suggestion of the right way to do anything, or advice on
how you should do something. It's just how I start out on some of the apps I
work on. I use this when I need to rapidly get a prototype to the users, and
authentication is required, but not of utmost concern.

If you're thinking about using this on your production app, don't.

## Configuration

- `name` **required** The name of the app.
- `domain` **required** Domain of the app.
- `users` **required** Provide an array of objects. Email is required.
  Everything else in the object becomes part of the token.
- `mailgun_api_key` **required**
- `mailgun_domain` If different from `domain`.
- `secret` Randomly generated if not provided.
- `signinTimeout` Time in milliseconds for a signin to expire. Defaults to 10
  minutes.
- `tokenTimeout` Time in milliseconds for a token to expire. Won't expire unless
  set.

## API

Functions provided by the returned object that are used in an implementation.

- `signin(email)` Start the signin process. Email the user a jti.
- `exchange(email, jti)` Complete the authentication process. Use `email` and
  `jti` to get a token.
- `verify(token)` Verify a token.
