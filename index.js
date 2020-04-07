'use strict';

var fs = require('fs');

module.exports = function (opts) {
  var obj = {};

  // the users
  obj.users = opts.users;

  // find a user
  obj.findUser = function (email) {
    return obj.users.find(function (el) {
      return el.email == email;
    });
  };

  // request a session for this user
  // create a claim
  // email user
  obj.request = function (email) {};

  return obj;
};
