require('./auth')
  .verify(String(process.argv[2]))
  .then(function (session) {
    console.log(session);
  });
