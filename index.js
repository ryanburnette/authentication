'use strict';

var jsonwebtoken = require('jsonwebtoken');
var fs = require('fs');

module.exports = function (opts) {
  if (!opts.secret) {
    opts.secret = String(random() + random() + random() + random());
  }

  if (!opts.signinTimeout) {
    opts.signinTimeout = 600000;
  }

  function findUser(email) {
    var u = opts.users.find(function (el) {
      return email == el.email;
    });
    if (!u) {
      return null;
    }
    return clone(u);
  }

  function signin(email) {
    var u = findUser(email);
    if (!u) {
      throw err('ENOUSER', 'user not found');
    }

    var jti = generateJti();

    fs.writeFileSync(
      './.authentication/' + String(jti),
      JSON.stringify({
        email,
        createdAt: new Date()
      })
    );

    sendSigninEmail({ email, jti });
  }

  function sendSigninEmail({ email, jti }) {
    // TODO
    console.log('send signin email', email, jti);
  }

  function exchange({ email, jti }) {
    expireUnclaimedJti(jti);
    var fn = './.authentication/' + String(jti);
    if (!fs.existsSync(fn)) {
      throw err('ENOENT', 'jti does not exist');
    }
    var obj = JSON.parse(fs.readFileSync('./.authentication/' + String(jti)));
    if (email != obj.email) {
      throw err('EMMSMT', 'email mismatch');
    }
    if (obj.claimedAt) {
      throw err('EALCLM', 'already claimed');
    }
    var user = findUser(email);
    if (!user) {
      throw err('ENOUSR', 'user does not exist');
    }
    obj.claimedAt = new Date();
    fs.writeFileSync(fn, JSON.stringify(obj));
    return jsonwebtoken.sign({ user }, opts.secret, { jwtid: jti });
  }

  function verify(token) {
    return jsonwebtoken.verify(token, opts.secret);
  }

  function signout(token) {
    var obj = verify(token);
    var fn = './.authentication/' + String(obj.jti);
    if (fs.existsSync(fn)) {
      fs.unlinkSync(fn);
    }
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function random() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  function err(code, message) {
    var e = new Error(message);
    e.code = code;
    return e;
  }

  function generateJti() {
    var jti = random();
    var existingJtis = fs.readdirSync('./.authentication/');
    expireUnclaimedJtis(existingJtis);
    if (existingJtis.includes(jti)) {
      return generateJti();
    }
    fs.writeFileSync('./.authentication/' + jti);
    return jti;
  }

  function expireUnclaimedJti(jti) {
    var fn = './.authentication/' + String(jti);
    if (fs.existsSync(fn)) {
      var obj = JSON.parse(fs.readFileSync(fn));
      if (
        !obj.claimedAt &&
        new Date() - new Date(obj.createdAt) > opts.signinTimeout
      ) {
        fs.unlinkSync(fn);
      }
    }
  }

  function expireUnclaimedJtis(jtis) {
    jtis.forEach(expireUnclaimedJti);
  }

  function expireAgedJti(jti) {
    if (!opts.tokenTimeout) {
      return;
    }
    var fn = './.authentication/' + String(jti);
    if (fs.existsSync(fn)) {
      var obj = JSON.parse(fs.readFileSync(fn));
      if (
        obj.claimedAt &&
        new Date() - new Date(obj.claimedAt) > opts.tokenTimeout
      ) {
        fs.unlinkSync(fn);
      }
    }
  }

  function expireAgedJtis(jtis) {
    jtis.forEach(expireAgedJti);
  }

  return { signin, exchange, verify };
};
