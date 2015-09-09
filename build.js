var Metalsmith = require('metalsmith')
    markdown = require('metalsmith-markdown');

Metalsmith(__dirname)
  .source('./src')
  .use(markdown())
  .destination('./build')
  .build(function(err) {
    if (err) throw err;
  });
