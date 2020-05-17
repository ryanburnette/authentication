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
  auth = Authentication({ users, domain: 'localhost', mailgunApiKey: '123' });
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
      throw new Error('should not get here');
    })
    .catch(function (error) {
      expect(error.code).toBe('ERR_INVALID_TOKEN');
    });
});
