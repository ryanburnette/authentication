# [authentication](https://github.com/ryanburnette/authentication)

[![repo](https://img.shields.io/badge/repository-Github-black.svg?style=flat-square)](https://github.com/ryanburnette/authentication)
[![npm](https://img.shields.io/badge/package-NPM-green.svg?style=flat-square)](https://www.npmjs.com/package/@ryanburnette/authentication)

A Node.js authentication library.

## About

Back when I used Ruby on Rails, I loved how quickly I could build an app with
user-friendly authentication using
[Devise](https://github.com/heartcombo/devise). There are similar options for
Node.js and Express, but none of them met my needs, so I wrote this.

This library is not a suggestion of the right way to do anything, or advice on
how you should do something. It's just how I do it on some of the apps I work
on.

You give this library some options, and it gives you what you need for a basic
authentication strategy.

## Strategy

This library provides an authentication strategy where you'll have a list of
users who, when they initiate a signin, are sent an email that contains an
exchangeToken which is exchanged for a token (jwt), that is passed to requests
as a header `Authorization: Bearer [token]` to authenticate requests.

## Configuration

See
[`index.js`](https://github.com/ryanburnette/authentication-example/blob/master/index.js#L20-L48)
in
[@ryanburnette/authentication-example](https://github.com/ryanburnette/authentication-example).

Here are the things to configure:

- `users` **required** An array of objects. Each user must have `name` and
  `email` attributes. Include whatever else you want, but it's best to keep the
  object small to keep the token small.
- `email` **required** A callback for sending the user their exchangeToken.
- `storage` _optional_ Provide a [storage](#storage) library if you need
  persistence.

## API

Functions provided by the returned object. Arguments are always attributes of an
`opts` function (except for the authorize middleware).

- `users({ email })` Get an array of the user objects. Pass an email to find one
  user by their email.
- `sessions({ email, exchangeToken })` Get an array of the session objects. A
  session basically just an unexpired token, but it also keeps track of the `ip`
  and `ua` of the browser that got the token. Pass an email to get the sessions
  for that user. Pass an exchangeToken to get the session for that
  exchangeToken.
- `signin({ email })` Start the authentication process. Calls the `email`
  callback.
- `exchange({ exchangeToken })` Complete the authentication process. Exhcange an
  exchagneToken for a token.
- `signout({ uuid, token })` Invalidate a session.
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
- I include a password field that is ignored so users aren't confused by a login
  form that online includes an email address. This also makes the app compatible
  with password managers.

## Limitations

- This is meant for apps with a small number of users.
- This isn't meant to be the most secure implementation ever. If it's good
  enough, use it. If it's not good enough, use something else.
