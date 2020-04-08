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

## Configuration

## API

- `users()` Get an array of the user objects. Pass an email to find one user by
  their email.  
  `{email}`
- `sessions()` Get an array of the session objects. A session basically just an
  unexpired token, but it also keeps track of the `ip` and `ua` of the browser
  that got the token. Pass an email to get the sessions for that user. Pass an
  exchangeToken to get the session for that exchangeToken.  
  `{email, exchangeToken}`
- `signin(email)` Start the authentication process. Email the user an
  exchangeToken that they'll trade for their token.
- `signout(token|id)` Sign a session out.
- `exchange(exchangeToken)` Complete the authentication process. Exhcange an
  exchagneToken for a token.
- `authorize(req, res, next)` Express middleware for authorizing requests.
  Requests should set `Authorization: Bearer [token]`. If the request isn't
  authorized, return 401.

## Usage

```
npm install @ryanburnette/authentication
```

See `example.js`.

## Implementation

- I use [hashcash](https://github.com/ryanburnette/hashcash) to protect the
  `/signin` endpoint.
- I include a password field that is ignored so users aren't confused by a login
  form that online includes an email address. This also makes the app compatible
  with password managers.

## Limitations

- This is meant for apps with a small number of users.
- This isn't meant to be the most secure implementation ever. If it's good
  enough, it's good enough. If it's not, use something else.
