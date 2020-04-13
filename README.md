# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A Node.js authentication library.

## About

Back when I was primarily using Ruby on Rails, I loved how quickly I could get
straight-forward user authentication going with
[Devise](https://github.com/heartcombo/devise). This isn't meant to be as
robust, but it is meant to be quick.

This library is not a suggestion of the right way to do anything, or advice on
how you should do something. It's just how I do it on some of the apps I work
on. I use this when I need rapid deployment, and authentication is required, but
not of utmost concern.

## Strategy

This authentication strategy is one where you have a static users list. Those
users request an exchagneToken which they are then able to exchange for a token.
The token is passed along with all subsequent API requests.

## Configuration

See
[`index.js`](https://github.com/ryanburnette/authentication-example/blob/master/index.js#L20-L48)
in
[@ryanburnette/authentication-example](https://github.com/ryanburnette/authentication-example).

Here are the things to configure:

- `users` **required** Provide an array of user objects, or a Promise-returning
  function to get an array of user objects. Each user must have `name` and
  `email` attributes. Include whatever else you want, but this object will be
  used to build the token, so keep the attributes list as minimal as possible.
- `email` **required** A callback function that receives
  `{ user, exchangeToken }`. This gives you a place to email the user their
  exchangeToken and a URL to complete the sign in exchange.
- `storage` _optional_ Provide a [storage](#storage) library if you need
  persistence.
- `random` _optional_ Provide a function for generating the random exchangeToken
  which also serves as the session id.

## API

Functions provided by the returned object that are used in an implementation.

- `signin(email)` Start the authentication process. Calls the `email` callback.
- `exchange(exchangeToken)` Complete the authentication process. Exhcange an
  exchagneToken for a token.
- `signout(exchangeToken)` Invalidate a session.
- `authorize(req, res, next)` Express middleware for authorizing requests.
  Requests should set `Authorization: Bearer [token]`. If the request isn't
  authorized, return 401.

## Usage

```
npm install @ryanburnette/authentication
```

See
[@ryanburnette/authentication-example](https://github.com/ryanburnette/authentication-example).

## Storage

If you want persistence, there are two options for storage libraries.

- [@ryanburnette/authentication-storage-fs](https://github.com/ryanburnette/authentication-storage-fs)
- [@ryanburnette/authentication-storage-sequelize](https://github.com/ryanburnette/authentication-storage-sequelize)

## Implementation

- I use Mailgun to send the emails.
- I use EJS to render my templates.
- I use [hashcash](https://github.com/ryanburnette/hashcash) to protect the
  `/signin` endpoint from abuse.
- I include a password field that is ignored so users aren't confused by a sign
  in form that lacks a password field. This also makes the app compatible with
  password managers.

## Limitations

- This is meant for apps with a small number of users.
- This isn't meant to be the most secure implementation ever. If it's good
  enough, use it. If it's not good enough, use something else.
