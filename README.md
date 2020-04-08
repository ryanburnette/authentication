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

## Strategy

This library provides an authentication strategy where you'll have a list of
users who, when they initiate a signin, receive an email, delivered by Mailgun,
that contains an exchangeToken which allows them to obtain a jsonwebtoken, or
token, that can be passed to requests as a header
`Authorization: Bearer [token]` in order to authenticate requests.

## Configuration

See the
[`config` object in `example.js`](https://github.com/ryanburnette/authentication/blob/master/example/index.js#L8-L27).

Here are the things to configure:

- `users` An array of objects. Each user must have `name` and `email`
  attributes. Include whatever else you want, but it's best to keep the object
  small to keep the token small.
- `mailgun` Must set `apiKey` and `domain`.
- `email` This is a template for the signin email. EJS is used to render each
  field.
- `storage` Provide a storage library if you need persistence.

## Storage

There are two options for storage libraries.

- [@ryanburnette/authentication-storage-fs](https://github.com/ryanburnette/authentication-storage-fs)
- [@ryanburnette/authentication-storage-sequelize](https://github.com/ryanburnette/authentication-storage-sequelize)

## API

Functions provided by the returned object. Arguments are always attributes of an
`opts` function.

- `users({ email })` Get an array of the user objects. Pass an email to find one
  user by their email.
- `sessions({ email, exchangeToken })` Get an array of the session objects. A
  session basically just an unexpired token, but it also keeps track of the `ip`
  and `ua` of the browser that got the token. Pass an email to get the sessions
  for that user. Pass an exchangeToken to get the session for that
  exchangeToken.
- `signin({ email })` Start the authentication process. Email the user an
  exchangeToken that they'll exchange for their token.
- `signout({ uuid, token })` Sign a session out.
- `exchange({ exchangeToken })` Complete the authentication process. Exhcange an
  exchagneToken for a token.
- `authorize(req, res, next)` Express middleware for authorizing requests.
  Requests should set `Authorization: Bearer [token]`. If the request isn't
  authorized, return 401.

## Usage

```
npm install @ryanburnette/authentication
```

See
[`example.js`](https://github.com/ryanburnette/authentication/blob/master/example/index.js).

## Implementation

- I use [hashcash](https://github.com/ryanburnette/hashcash) to protect the
  `/signin` endpoint.
- I include a password field that is ignored so users aren't confused by a login
  form that online includes an email address. This also makes the app compatible
  with password managers.

## Limitations

- This is meant for apps with a small number of users.
- This isn't meant to be the most secure implementation ever. If it's good
  enough, use it. If it's not good enough, use something else.
