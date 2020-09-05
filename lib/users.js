'use strict';

var clone = require('lodash/cloneDeep');

module.exports = function (users) {
  var _users = clone(users);

  async function all() {
    return clone(_users);
  }

  async function find(email) {
    return all().then(function (users) {
      return users.find((u) => email === u.email);
    });
  }

  return { all, find };
};
