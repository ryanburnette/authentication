var auth = require('./auth');

console.log(
  auth.exchange({
    email: 'ryan.burnette@gmail.com',
    jti: String(process.argv[2])
  })
);
