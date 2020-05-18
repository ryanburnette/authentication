'use strict';

var clone = require('lodash.clonedeep');

module.exports = function (users) {
  var obj = {};

  var _users = clone(users);

  obj.all = async function () {
    return _users.map(function (user) {
      return clone(user);
    });
  };

  obj.find = async function (email) {
    return obj.all().then(function (_users) {
      return _users.find(function (user) {
        return user.email === email;
      });
    });
  };

  return obj;
};
