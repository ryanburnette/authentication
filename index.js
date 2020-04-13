'use strict';

var getBearerToken = require('@ryanburnette/get-bearer-token');
var jsonwebtoken = require('jsonwebtoken');

module.exports = function (opts) {
  var obj = {};

  obj.random = random;
  if (opts.random) {
    obj.random = opts.random;
  }

  obj.users = function () {
    if (Array.isArray(opts.users)) {
      return Promise.resolve(opts.users);
    }
    return opts.users();
  };

  obj.user = function (email) {
    return obj.users().then(function (users) {
      var u = users.find(function (el) {
        return email == el.email;
      });
      if (!u) {
        return null;
      }
      return clone(u);
    });
  };

  var sessions = [];

  obj.sessions = function () {
    // TODO expire old sessions
    // TODO don't let a single user have more than 3 unclaimed sessions, things could get out of hand
    return Promise.resolve(sessions);
  };

  obj.session = function (exchangeToken) {
    return obj.sessions().then(function (ss) {
      return ss.find(function (s) {
        return s.exchangeToken == exchangeToken;
      });
    });
  };

  obj.userSessions = function (email) {
    return obj.sessions().then(function (ss) {
      return ss.filter(function (s) {
        return s.email == email;
      });
    });
  };

  obj.exchangeTokens = [];

  obj.signin = function (email) {
    return obj
      .user(email)
      .then(function (user) {
        if (!user) {
          throw new Error('user not found');
        }

        var session = {};
        var exchangeToken = obj.random();
        session.exchangeToken = exchangeToken;
        session.verified = false;

        obj.email({ user, exchangeToken });

        obj.save();
      })
      .catch(function (err) {
        if (String('err').includes('user not found')) {
          return false;
        }
        throw err;
      });
  };

  obj.exchange = function ({ exchangeToken, ip, ua }) {
    return obj.session(exchangeToken).then(function (s) {
      if (!s || s.exchanged) {
        return false;
      }

      s.exchanged = true;

      obj.exchangeTokens.push(exchangeToken);
      if (obj.storage) {
        obj.save();
      }

      return s;
    });
  };

  obj.authorize = function (req, res, next) {
    var token = getBearerToken(req);
    if (!token) {
      return unauthorized(res);
    }

    var user = {};
    if (!user) {
      return unauthorized(res);
    }
    req.user = user;

    next();
  };

  obj.storage = opts.storage;
  obj.save = function () {
    if (!obj.storage) {
      return false;
    }

    obj.sessions().then(function (sessions) {
      return obj.storage.save({
        sessions,
        exchangeTokens: obj.exchangeTokens
      });
    });
  };

  if (obj.storage) {
    obj.storage
      .load()
      .then(function (lobj) {
        if (lobj) {
          sessions = lobj.sessions;
          obj.exchangeTokens = lobj.exchangeTokens;
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  obj.email =
    opts.email ||
    function () {
      throw new Error('email function not provided');
    };

  return obj;
};

function unauthorized(res) {
  return res.sendStatus(401);
}

function random() {
  return Math.floor(100000 + Math.random() * 900000);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
