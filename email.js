'use strict';

var fs = require('fs');
var path = require('path');
var mailgun = require('mailgun-js');
var ejs = require('ejs');

module.exports = function (opts) {
  if (!opts.mailgun) {
    opts.mailgun = mailgun({
      apiKey: opts.mailgunApiKey,
      domain: opts.domain || opts.mailgunDomain
    });
  }

  return async function ({ email, signinToken }) {
    return templates().then(function (templates) {
      var proto = opts.env == 'development' ? 'http' : 'https';
      var url =
        proto + '://' + opts.domain + opts.signinUrl ||
        '/' + '/#' + signinToken;
      var data = {
        from: `${opts.name} <no-reply@${opts.mailgunDomain || opts.domain}>`,
        to: email,
        subject: `Sign In to ${opts.name} ${signinToken}`,
        html: ejs.render(templates.html, { opts, url }),
        text: ejs.render(templates.text, { opts, url })
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
  };
};

var _templates;
async function templates() {
  if (_templates) {
    return _templates;
  }
  return Promise.all([
    fs.promises.readFile(path.resolve(__dirname, './email.html')),
    fs.promises.readFile(path.resolve(__dirname, './email.txt'))
  ]).then(function ([html, text]) {
    _templates = { html: html.toString(), text: text.toString() };
    return templates();
  });
}
