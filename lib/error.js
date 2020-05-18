'use strict';

module.exports = function (code, message) {
  var error = new Error(message);
  if (code) {
    error.code = code;
  }
  return error;
};
