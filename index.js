'use strict';

var Mailgun = require('mailgun-js');

module.exports = function(opts) {
  var obj = {};

  var mailgun = Mailgun({
    apiKey: opts.mailgun.apiKey,
    domain: opts.mailgun.domain
  });

  obj.random = random;
  if (opts.random) {
    obj.random = opts.random;
  }

  var users = opts.users;

  obj.users = function(opts) {
    if (opts.email) {
      return users.find(function(u) {
        return u.email == opts.email;
      });
    }

    return users;
  };

  // a list of excluded jti's
  // load on init
  // save on change
  obj.exclusions = [];

  // load on init
  // save on change
  var sessions = [];

  obj.sessions = function(opts) {
    if (opts.email) {
      return sessions.filter(function(s) {
        return s.email == opts.email;
      });
    }

    if (opts.exchangeToken) {
      return sessions.find(function(s) {
        return s.exchangeToken == opts.exchangeToken;
      });
    }

    return sessions;
  };

  obj.exchange = function(opts) {};

  obj.authorize = function(req, res, next) {
    var token = getBearerToken(req);
    if (!token) {
      return unauthorized(res);
    }
    var token = req.token;

    var user = {};
    if (!user) {
      return unauthorized(res);
    }
    req.user = user;

    next();
  };

  return obj;
};

function unauthorized(res) {
  return res.sendStatus(401);
}

function random() {
  return Math.floor(100000 + Math.random() * 900000);
}
