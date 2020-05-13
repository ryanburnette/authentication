'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (opts) {
  if (!opts) {
    throw error(null, 'opts is required');
  }

  if (!opts.dir) {
    opts.dir = './.authentication/';
  }

  if (!fs.existsSync(opts.dir)) {
    fs.mkdirSync(opts.dir);
  }

  function getSession(jti) {
    var fn = path.join(opts.dir, jti);
    if (fs.existsSync(fn)) {
      return fs.promises.readFile(fn, 'utf8').then(function (data) {
        return JSON.parse(data);
      });
    }
    return Promise.resolve(false);
  }

  function allJtis() {
    return fs.promises.readdir(opts.dir).then(function (data) {
      return data;
    });
  }

  function saveSession(session) {
    if (!session) {
      error(null, 'session is required');
    }
    if (!session.jti) {
      error(null, 'session.jti is required');
    }
    if (!session.email) {
      error(null, 'session.email is required');
    }
    var fn = path.join(opts.dir, session.jti);
    return fs.promises.writeFile(fn, JSON.stringify(session));
  }

  function deleteSession(jti) {
    var fn = path.join(opts.dir, jti);
    if (fs.existsSync(fn)) {
      return fs.promises.unlink(fn);
    }
    return Promise.resolve(false);
  }

  return { getSession, allJtis, saveSession, deleteSession };
};

function error(code, description) {
  var _err = new Error(
    '@ryanburnette/authentication/storage-fs: ' + description
  );
  if (code) {
    _err.code = code;
  }
  return _err;
}
