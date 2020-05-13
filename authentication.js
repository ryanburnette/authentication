'use strict';

var fs = require('fs');
var path = require('path');
var jsonwebtoken = require('jsonwebtoken');
var mailgun = require('mailgun-js');
var ejs = require('ejs');

module.exports = function (opts) {
  if (!opts) {
    throw new Error('opts is required');
  }

  if (!opts.secret) {
    opts.secret = String(random() + random() + random() + random());
  }

  if (!opts.signinTimeout) {
    opts.signinTimeout = 600000;
  }

  if (!opts.env) {
    opts.env = 'development';
  }

  if (!opts.users) {
    throw new Error('opts.users is required');
  }

  if (!opts.domain) {
    throw new Error('opts.domain is required');
  }

  opts.mailgun = mailgun({
    apiKey: opts.mailgunApiKey,
    domain: opts.mailgunDomain || opts.domain
  });

  if (!opts.storage) {
    opts.storage = require('./storage-fs')({
      dir: opts.dir
    });
  }

  if (Array.isArray(opts.users)) {
    var _users = clone(opts.users);
    opts.users = function () {
      return Promise.resolve(_users);
    };
  }

  function findUser(email) {
    return opts.users().then(function (users) {
      var u = users.find(function (el) {
        return email == el.email;
      });
      if (u) {
        return clone(u);
      }
    });
  }

  function signin(email) {
    return findUser(email)
      .then(function (user) {
        if (!user) {
          throw error('ENOUSER', 'user not found');
        }
        return Promise.all([user, makeSession(email)]);
      })
      .then(function ([user, session]) {
        var actions = [];
        if (['staging', 'production'].includes(opts.env)) {
          return sendSigninEmail(email, session.jti).then(function () {
            return session;
          });
        }
        return session;
      });
  }

  function exchange(jti) {
    jti = String(jti);
    return expireUnclaimedSession(jti)
      .then(function () {
        return opts.storage.getSession(jti);
      })
      .then(function (session) {
        if (session && session.claimedAt) {
          throw error('EALCLM', 'session already claimed');
        }
        return Promise.all([session, findUser(session.email)]);
      })
      .then(function ([session, user]) {
        if (!user) {
          throw error('ENOUSR', 'user does not exist');
        }
        session.claimedAt = new Date();
        var token = jsonwebtoken.sign({ user }, opts.secret, { jwtid: jti });
        return opts.storage.saveSession(session).then(function () {
          return token;
        });
      });
  }

  function jwtVerify(token) {
    return new Promise(function (resolve, reject) {
      jsonwebtoken.verify(token, opts.secret, function (err, decoded) {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  function verify(token) {
    return jwtVerify(token).then(function (decoded) {
      return opts.storage.getSession(decoded.jti).then(function (session) {
        if (!session) {
          throw error(null, 'token valid, but session does not exist');
        }
        return decoded;
      });
    });
  }

  function signout(token) {
    return verify(token).then(function (session) {
      return opts.storage.deleteSession(session.jti);
    });
  }

  function makeSession(email) {
    var jti = String(random());
    return opts.storage
      .allJtis()
      .then(function (existingJtis) {
        if (existingJtis.includes(jti)) {
          throw error('DUP', 'jti already exists');
        }
        return Promise.all(
          existingJtis.map(function (jti) {
            return expireUnclaimedSession(jti);
          })
        );
      })
      .then(function () {
        var session = {
          email,
          jti,
          createdAt: new Date()
        };
        return opts.storage.saveSession(session).then(function () {
          return session;
        });
      })
      .catch(function (err) {
        if (err.code == 'DUP') {
          return makeSession(email);
        }
        throw err;
      });
  }

  function expireUnclaimedSession(jti) {
    jti = String(jti);
    return opts.storage.getSession(jti).then(function (session) {
      if (session) {
        var unclaimed = !session.claimedAt;
        var expired =
          new Date() - new Date(session.createdAt) > opts.signinTimeout;
        if (unclaimed && expired) {
          return opts.storage.deleteSession(session.jti);
        }
      }
      return Promise.resolve();
    });
  }

  function sendSigninEmail(email, jti) {
    jti = String(jti);
    return templates().then(function (ts) {
      var data = {
        from: `${opts.app} <no-reply@${opts.mailgunDomain || opts.domain}>`,
        to: email,
        subject: `Sign In to ${opts.app} ${jti}`,
        html: ejs.render(ts.html, { opts, jti }),
        text: ejs.render(ts.text, { opts, jti })
      };

      return new Promise(function (resolve, reject) {
        opts.mailgun.messages().send(data, function (error, body) {
          if (error) {
            reject(error);
          }
          resolve(body);
        });
      });
    });
  }

  // TODO token expiration

  return { signin, exchange, verify, signout };
};

function error(code, description) {
  var _err = new Error('@ryanburnette/authentication: ' + description);
  if (code) {
    _err.code = code;
  }
  return _err;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function random() {
  return Math.floor(100000 + Math.random() * 900000);
}

var ts;
function templates() {
  if (ts) {
    return Promise.resolve(ts);
  }

  return Promise.all([
    fs.promises.readFile(path.resolve(__dirname, './email.html')),
    fs.promises.readFile(path.resolve(__dirname, './email.txt'))
  ]).then(function ([html, text]) {
    ts = { html: html.toString(), text: text.toString() };
    return ts;
  });
}
