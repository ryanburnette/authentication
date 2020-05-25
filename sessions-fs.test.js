'use strict';

var sessions;

test('init', function () {
  sessions = require('./sessions-fs')({});
});

test('save', function () {
  return Promise.all([
    sessions.save({
      signinToken: '123',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    }),
    sessions.save({
      signinToken: '456',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    }),
    sessions.save({
      signinToken: '789',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    })
  ]).then(function ([a, b, c]) {
    expect(a.signinToken).toBe('123');
    expect(b.signinToken).toBe('456');
    expect(c.signinToken).toBe('789');
  });
});

test('find', function () {
  return sessions.find('123').then(function (session) {
    expect(session.signinToken).toBe('123');
    expect(session.email).toBe('ryan.burnette@gmail.com');
  });
});

test('remove', function () {
  return sessions
    .remove('456')
    .then(function () {
      return sessions.find('456');
    })
    .then(function (session) {
      expect(session).toBeFalsy();
    });
});
