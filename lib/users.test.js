'use strict';

var initUsers = require('./users');

var users = initUsers([
  {
    email: 'a'
  },
  {
    email: 'b'
  }
]);

test('find', function () {
  return users.find('a').then((user) => expect(user.email).toBe('a'));
});
