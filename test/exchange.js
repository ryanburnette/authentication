require('./auth')
  .exchange(process.argv[2])
  .then(function (token) {
    console.log(token);
  });
