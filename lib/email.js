'use strict';

const path = require('path');
const fs = require('fs').promises;
const ejs = require('ejs');
const nodemailer = require('nodemailer');

module.exports = function (opts) {
  if (!opts) {
    opts = {};
  }
  if (!opts.name) {
    throw new Error('opts.name is required');
  }
  if (!opts.domain) {
    throw new Error('opts.domain is required');
  }
  if (!opts.signinUrl) {
    opts.signinUrl = '/';
  }
  if (!opts.smtp) {
    throw new Error('opts.smtp is required');
  }

  let transporter = nodemailer.createTransport(opts.smtp);

  return async function ({ email, signinToken }) {
    return Promise.resolve()
      .then(function () {
        return Promise.all([
          fs.readFile(path.resolve(__dirname, '../templates/email.html')),
          fs.readFile(path.resolve(__dirname, '../templates/email.txt'))
        ]);
      })
      .then(function ([html, text]) {
        // console.log('html, text', html, text);
        return {
          html: html.toString(),
          text: text.toString()
        };
      })
      .then(function (templates) {
        // console.log('templates', templates);
        let proto = opts.proto || 'http';
        let url = `${proto}://${opts.domain}${opts.signinUrl}#${signinToken}`;

        return transporter.sendMail({
          from: opts.from || `${opts.name} <no-reply@${opts.domain}>`,
          to: email,
          subject: `Sign In to ${opts.name} ${signinToken}`,
          html: ejs.render(templates.html, { opts, url }),
          text: ejs.render(templates.text, { opts, url })
        });
      })
      .then(function (obj) {
        // console.log('obj', obj);
        return obj;
      });
  };
};
