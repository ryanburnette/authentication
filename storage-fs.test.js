'use strict';

var storage;

test('init', function () {
  storage = require('./storage-fs')({});
});

test('save', function () {
  return Promise.all([
    storage.save({
      signinToken: '123',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    }),
    storage.save({
      signinToken: '456',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    }),
    storage.save({
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
  return storage.find('123').then(function (session) {
    expect(session.signinToken).toBe('123');
    expect(session.email).toBe('ryan.burnette@gmail.com');
  });
});

test('delete', function () {
  return storage
    .delete('456')
    .then(function () {
      return storage.find('456');
    })
    .then(function (session) {
      expect(session).toBeFalsy();
    });
});
