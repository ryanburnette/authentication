'use strict';

var fs = require('fs');
var path = require('path');
var newError = require('./error');

module.exports = function (opts = {}) {
  if (!opts.dir) {
    opts.dir = './.authentication/';
  }

  if (!fs.existsSync(opts.dir)) {
    fs.mkdirSync(opts.dir);
  }

  async function save(session) {
    return fs.promises
      .writeFile(
        path.join(opts.dir, session.signinToken),
        JSON.stringify(session)
      )
      .then(function () {
        return session;
      });
  }

  async function find(signinToken) {
    return fs.promises
      .readFile(path.join(opts.dir, signinToken), 'utf8')
      .then(function (data) {
        return JSON.parse(data);
      })
      .catch(function (error) {
        if (error.code === 'ENOENT') {
          return false;
        }
        throw error;
      });
  }

  async function remove(signinToken) {
    var fn = path.join(opts.dir, signinToken);
    return fs.promises
      .stat(fn)
      .then(function () {
        return fs.promises.unlink(fn);
      })
      .catch(function (error) {
        if (error.code === 'ENOENT') {
          return false;
        }
        throw error;
      });
  }

  return { save, find, remove };
};
