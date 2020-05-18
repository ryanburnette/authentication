'use strict';

var fs = require('fs');
var path = require('path');
var newError = require('./lib/error');

module.exports = function (opts = {}) {
  var obj = {};

  if (!opts.dir) {
    opts.dir = './.authentication/';
  }

  if (!fs.existsSync(opts.dir)) {
    fs.mkdirSync(opts.dir);
  }

  obj.save = async function (session) {
    return fs.promises
      .writeFile(
        path.join(opts.dir, session.signinToken),
        JSON.stringify(session)
      )
      .then(function () {
        return session;
      });
  };

  obj.find = async function (signinToken) {
    return fs.promises
      .readFile(path.join(opts.dir, signinToken), 'utf8')
      .then(function (data) {
        return JSON.parse(data);
      })
      .catch(function (error) {
        return false;
      });
  };

  obj.delete = async function (signinToken) {
    var fn = path.join(opts.dir, signinToken);
    if (fs.existsSync(fn)) {
      return fs.promises.unlink(fn);
    }
  };

  return obj;
};
