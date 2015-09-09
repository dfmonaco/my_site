var Metalsmith = require('metalsmith');

Metalsmith(__dirname)
  .source('./src')
  .destination('./build')
  .build(function(err) {
    if (err) throw err;
  });
