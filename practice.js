'use strict';

var keypairs = require('keypairs');

var user = {
  name: 'Ryan Burnette',
  email: 'ryan.burnette@gmail.com'
};

// user starts the signin process
// session looks like this
var session = {
  email: 'ryan.burnette@gmail.com',
  exchangeToken: '123',
  verified: false,
  ip: '',
  ua: '',
  publicKey: '',
  kid: ''
};

// next step, POST comes in w/ email, exchangeToken, and these 4 attrs
session.ip = '';
session.ua = '';
session.publicKey = '...';
session.kid = '...';
// verify that kid the sha sum of publicKey

// authorize step
function authorize(req, res, next) {
  var token = getBearerToken(req);

  var decoded = decode(token);

  // find my session
  var session = findSession({ kid: decoded.kid });

  // certain keys need to match between session and decoded
  // email, exchangeToken, kid

  // verify by session.publicKey

  var user = findUser({ email: session.email });

  if (!user) {
    return unauthorized(res);
  }

  req.user = user;
  req.session = session;
  next();
}
