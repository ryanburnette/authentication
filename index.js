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

  if (!opts.dir) {
    opts.dir = './.authentication/';
  }

  if (!fs.existsSync(opts.dir)) {
    fs.mkdirSync(opts.dir);
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

  ['users', 'domain'].forEach(function (el) {
    if (!opts[el]) {
      throw new Error(`opts.${el} is required`);
    }
  });

  opts.mailgun = mailgun({
    apiKey: opts.mailgunApiKey,
    domain: opts.domain
  });

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
    findUser(email)
      .then(function (user) {
        if (!user) {
          throw err('ENOUSER', 'user not found');
        }
        return Promise.all([user, makeSession(email)]);
      })
      .then(function ([user, session]) {
        if (opts.env == 'production') {
          return sendSigninEmail(email, session.jti);
        } else {
          console.log('send signin email', session);
        }
      });
  }

  function exchange(jti) {
    var fn = opts.dir + String(jti);
    return expireUnclaimedSession(jti)
      .then(function () {
        return fs.promises.stat(fn);
      })
      .then(function (exists) {
        if (!exists) {
          throw err('ENOENT', 'jti does not exist');
        }
        return fs.promises.readFile(fn);
      })
      .then(function (data) {
        var obj = JSON.parse(data);
        if (obj.claimedAt) {
          throw err('EALCLM', 'already claimed');
        }
        return Promise.all([obj, findUser(obj.email)]);
      })
      .then(function ([obj, user]) {
        if (!user) {
          throw err('ENOUSR', 'user does not exist');
        }
        obj.claimedAt = new Date();
        var token = jsonwebtoken.sign({ user }, opts.secret, { jwtid: jti });
        return fs.promises.writeFile(fn, JSON.stringify(obj)).then(function () {
          return token;
        });
      });
  }

  function verify(token) {
    token = jsonwebtoken.verify(token, opts.secret);
    var fn = path.join(opts.dir, String(token.jti));
    return fs.promises.stat(fn).then(function () {
      return token;
    });
  }

  function signout(token) {
    var fn;
    return verify(token)
      .then(function (token) {
        if (!token) {
          throw err('ENOENT', 'token not found');
        }
        fn = opts.dir + String(token.jti);
        return fs.promises.stat(fn);
      })
      .then(function (exists) {
        if (exists) {
          return fs.promises.unlink(fn);
        }
      })
      .catch(function (err) {
        if (err.code == 'ENOENT') {
          return null;
        }
        throw err;
      });
  }

  function makeSession(email) {
    var jti = String(random());
    return fs.promises
      .readdir(opts.dir)
      .then(function (existingJtis) {
        if (existingJtis.includes(jti)) {
          throw err('DUP', 'jti already exists');
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
        return fs.promises
          .writeFile(path.join(opts.dir, jti), JSON.stringify(session))
          .then(function () {
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
    var fn = path.join(opts.dir, String(jti));
    return fs.promises
      .stat(fn)
      .then(function (exists) {
        if (!exists) {
          throw err('ENOENT', 'jti not found');
        }
        return fs.promises.readFile(fn).then(function (data) {
          var obj = JSON.parse(data);
          var unclaimed = !obj.claimedAt;
          var expired =
            new Date() - new Date(obj.createdAt) > opts.signinTimeout;
          if (unclaimed && expired) {
            return fs.promises.unlink(fn);
          }
        });
      })
      .catch(function (err) {
        if (err.code == 'ENOENT') {
          return null;
        }
        throw err;
      });
  }

  function sendSigninEmail(email, jti) {
    jti = String(jti);

    return templates().then(function (ts) {
      var data = {
        from: `${opts.app} no-reply@${opts.domain}`,
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

function err(code, message) {
  var e = new Error(message);
  e.code = code;
  return e;
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
