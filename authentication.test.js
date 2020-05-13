'use strict';

var Authentication = require('./authentication');

var auth;

var users = [
  {
    email: 'ryan.burnette@gmail.com'
  },
  {
    email: 'foobar@localhost'
  }
];

test('init', function () {
  auth = Authentication({ users, domain: 'localhost', mailgunApiKey: '123' });
  expect(auth).toBeTruthy();
});

var jti;
test('signin', function () {
  return auth.signin('ryan.burnette@gmail.com').then(function (session) {
    jti = session.jti;
    expect(session.jti).toBeTruthy();
    expect(session.email).toBe('ryan.burnette@gmail.com');
  });
});

var token;
test('exchange', function () {
  return auth.exchange(jti).then(function (theToken) {
    token = theToken;
  });
});

test('verify', function () {
  return auth.verify(token).then(function (session) {
    expect(session.jti).toBe(jti);
  });
});

test('verify fail', function (done) {
  return auth
    .verify('asdf')
    .then(function () {
      throw new Error('should not get here');
      done();
    })
    .catch(function (error) {
      expect(String(error).includes('jwt malformed')).toBeTruthy();
      done();
    });
});
