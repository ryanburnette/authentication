'use strict';

var StorageFs = require('./storage-fs');
var storage;

test('init', function () {
  storage = StorageFs({});
});

test('saveSession', function () {
  return Promise.all([
    storage.saveSession({
      jti: '123',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    }),
    storage.saveSession({
      jti: '456',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    }),
    storage.saveSession({
      jti: '789',
      email: 'ryan.burnette@gmail.com',
      createdAt: new Date()
    })
  ]);
});

test('getSession', function () {
  return storage.getSession('123').then(function (session) {
    return Promise.all([
      expect(session.jti).toBe('123'),
      expect(session.email).toBe('ryan.burnette@gmail.com')
    ]);
  });
});

test('deleteSession', function () {
  return storage
    .deleteSession('456')
    .then(function () {
      return storage.getSession('456');
    })
    .then(function (session) {
      expect(session).toBeFalsy();
    });
});

test('allJtis', function () {
  return storage.allJtis().then(function (jtis) {
    return Promise.all([
      expect(jtis.includes('123')).toBeTruthy(),
      expect(jtis.includes('789')).toBeTruthy()
    ]);
  });
});
