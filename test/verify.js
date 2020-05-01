var auth = require('./auth');

console.log(auth.verify(String(process.argv[2])));
