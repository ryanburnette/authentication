'use strict';

var crypto = require('crypto');
var newError = require('./lib/error');
var merge = require('lodash.merge');

module.exports = function (opts = {}) {
  if (!opts.signinTimeout) {
    opts.signinTimeout = 600000;
  }

  if (!opts.env) {
    opts.env = 'development';
  }

  if (!opts.users) {
    throw new Error('opts.users is required');
  }

  if (Array.isArray(opts.users)) {
    opts.users = require('./users')(opts.users);
  } else {
    if (!opts.users.all) {
      throw new Error(
        'opts.users.all must be an async function that returns the users'
      );
    }
    if (!opts.users.find) {
      throw new Error(
        'opts.users.find must be an async function that takes an email address and returns a user'
      );
    }
  }

  if (!opts.storage) {
    opts.storage = require('./storage-fs')({ dir: opts.dir });
  } else {
    if (!opts.storage.find) {
      throw new Error(
        'opts.storage.find must be an async function that takes a signinToken and returns a session'
      );
    }
    if (!opts.storage.save) {
      throw new Error(
        'opts.storage.save must be an async function that takes a session'
      );
    }
    if (!opts.storage.remove) {
      throw new Error(
        'opts.storage.remove must be an async function that takes a signinToken'
      );
    }
  }

  if (!opts.email) {
    opts.email = require('./email')(opts);
  }

  async function signin({ email, attrs }) {
    return opts.users
      .find(email)
      .then(function (user) {
        if (!user) {
          throw newError('ENOUSER', 'user not found');
        }
        return Promise.all([user, makeSession({ email, attrs })]);
      })
      .then(function ([user, session]) {
        return Promise.all([user, opts.storage.save(session)]);
      })
      .then(function ([user, session]) {
        if (opts.env === 'development') {
          return { session };
        }
        return opts
          .email({ email, signinToken: session.signinToken })
          .then(function (email) {
            return { session, email };
          });
      });
  }

  async function exchange({ signinToken, attrs }) {
    return opts.storage
      .find(signinToken)
      .then(function (session) {
        if (!session) {
          throw newError('ENOENT', 'this session does not exist');
        }
        if (session.claimedAt) {
          throw newError(
            'ERR_SESSION_CLAIMED',
            'this signinToken has already been exchanged for an authorizationToken'
          );
        }
        if (new Date() - new Date(session.createdAt) > opts.signinTimeout) {
          throw newError('ERR_SIGNIN_EXPIRED', 'this signin has expired');
        }
        return Promise.all([session, opts.users.find(session.email)]);
      })
      .then(function ([session, user]) {
        if (!user) {
          throw newError(
            'ERR_USER_NOT_FOUND',
            'this session belongs to a user that does not exist'
          );
        }
        session.claimedAt = new Date();
        merge(session.attrs, attrs);
        session.authorizationToken = crypto.randomBytes(128).toString('hex');
        session.token = signinToken + '0' + session.authorizationToken;
        return opts.storage.save(session).then(function (session) {
          return { session, user };
        });
      });
  }

  async function verify(token) {
    if (token.length != 269) {
      throw newError('ERR_INVALID_TOKEN', 'invalid token');
    }
    if (token.substring(12, 13) != '0') {
      throw newError('ERR_INVALID_TOKEN', 'invalid token');
    }
    var signinToken = token.substring(0, 12);
    var authorizationToken = token.substring(13, 269);
    return opts.storage
      .find(signinToken)
      .then(function (session) {
        if (!session) {
          throw newError('ERR_SESSION_NOT_FOUND', 'session not found');
        }
        if (authorizationToken != session.authorizationToken) {
          throw newError('ERR_INVALID_TOKEN', 'invalid token');
        }
        if (!session.claimedAt) {
          throw newError('ERR_NOT_CLAIMED', 'this session was never claimed');
        }
        if (
          opts.sessionTimeout &&
          new Date() - new Date(session.claimedAt) > opts.sessionTimeout
        ) {
          throw newError('ERR_SESSION_EXPIRED', 'this signinToken has expired');
        }
        return Promise.all([session, opts.users.find(session.email)]);
      })
      .then(function ([session, user]) {
        if (!user) {
          throw newError('ERR_USER_NOT_FOUND', 'user not found');
        }
        return { session, user };
      });
  }

  async function signout(signinToken) {
    return opts.storage.find(signinToken).then(function (session) {
      if (!session) {
        throw newError('ENOENT', 'session not found');
      }
      return opts.storage.remove(session.signinToken);
    });
  }

  async function makeSession({ email, attrs }) {
    var signinToken = crypto.randomBytes(6).toString('hex');
    var createdAt = new Date();
    return opts.storage.find(signinToken).then(function (dup) {
      if (dup) {
        return makeSession({ email, attrs });
      }
      return {
        email,
        attrs,
        signinToken,
        createdAt
      };
    });
  }

  return { signin, exchange, verify, signout };
};
