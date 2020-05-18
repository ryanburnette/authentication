'use strict';

var fs = require('fs');

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
  auth = Authentication({
    name: 'Test App',
    users,
    domain: 'localhost',
    mailgunApiKey: '123'
  });
  expect(auth).toBeTruthy();
});

var signinToken;
test('signin', function () {
  return auth
    .signin({ email: 'ryan.burnette@gmail.com', attrs: { a: 'a', c: 'c' } })
    .then(function ({ session }) {
      signinToken = session.signinToken;
      expect(session.signinToken).toBeTruthy();
      expect(session.email).toBe('ryan.burnette@gmail.com');
      expect(session.attrs.a).toBe('a');
      expect(session.attrs.c).toBe('c');
      expect(
        fs.existsSync('./.authentication/' + session.signinToken)
      ).toBeTruthy();
    });
});

test('signin no user', function () {
  return auth
    .signin({ email: 'foobar@gmail.com' })
    .then(function () {
      fail('should not resolve if user does not exist');
    })
    .catch(function (error) {
      expect(error.code).toBe('ENOUSER');
    });
});

var testToken;
test('exchange', function () {
  var attrs = { a: 'aa', b: 'b' };
  return auth
    .exchange({ signinToken, attrs })
    .then(function ({ session, user }) {
      expect(session.signinToken).toBe(signinToken);
      expect(session.token.length).toBe(269);
      expect(user.email).toBe('ryan.burnette@gmail.com');
      expect(session.attrs.a).toBe('aa');
      expect(session.attrs.b).toBe('b');
      expect(session.attrs.c).toBe('c');
      testToken = session.token;
    });
});

test('verify', function () {
  return auth.verify(testToken).then(function ({ session, user }) {
    expect(session.signinToken).toBe(signinToken);
    expect(user.email).toBe('ryan.burnette@gmail.com');
  });
});

test('verify invalid token', function () {
  return auth
    .verify('000')
    .then(function () {
      fail('should not verify with invalid token');
    })
    .catch(function (error) {
      expect(error.code).toBe('ERR_INVALID_TOKEN');
    });
});

test('fails using signinToken', function () {
  return auth
    .verify(signinToken)
    .then(function () {
      fail('should not verify with invalid token');
    })
    .catch(function (error) {
      expect(error.code).toBe('ERR_INVALID_TOKEN');
    });
});

test('signinTimeout', function () {
  var auth = Authentication({
    name: 'Test App',
    users,
    domain: 'localhost',
    mailgunApiKey: '123',
    signinTimeout: 1000
  });
  return auth
    .signin({ email: 'ryan.burnette@gmail.com' })
    .then(function ({ session }) {
      return Promise.all([session, awaitTimeout(2000)]);
    })
    .then(function ([session, timeout]) {
      return auth.exchange({ signinToken: session.signinToken });
    })
    .then(function () {
      fail('signinTimeout should have caused an error to be thrown');
    })
    .catch(function (error) {
      expect(error.code).toBe('ERR_SIGNIN_EXPIRED');
    });
});

test('sessionTimeout', function () {
  var auth = Authentication({
    name: 'Test App',
    users,
    domain: 'localhost',
    mailgunApiKey: '123',
    sessionTimeout: 1000
  });
  var token;
  return auth
    .signin({ email: 'ryan.burnette@gmail.com' })
    .then(function ({ session }) {
      return auth.exchange({ signinToken: session.signinToken });
    })
    .then(function ({ session }) {
      return Promise.all([session, awaitTimeout(2000)]);
    })
    .then(function ([session, timeout]) {
      token = session.token;
      return auth.verify(token);
    })
    .then(function ({ session }) {
      fail('sessionTimeout should have caused an error to be thrown');
    })
    .catch(function (error) {
      expect(error.code).toBe('ERR_SESSION_EXPIRED');
    });
});

function awaitTimeout(timeout) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, timeout);
  });
}
