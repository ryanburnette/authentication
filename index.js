'use strict';

var fs = require('fs');
var Mailgun = require('mailgun-js');

module.exports = function(opts) {
  var obj = {};

  var users = opts.users;

  obj.users = function() {
    return users;
  };

  var mailgun = Mailgun({
    apiKey: opts.mailgun.apiKey,
    domain: opts.mailgun.domain
  });

  // a list of excluded jti's
  // load on init
  // save on change
  obj.exclusions = [];

  // load on init
  // save on change
  var sessions = [];

  obj.sessions = function() {
    return sessions;
  };

  obj.exchange = function(exchangeToken) {};

  return obj;
};
