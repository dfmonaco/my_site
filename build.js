var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');

var consolidate = require('consolidate');
var nunjucks = require('nunjucks');

var config = require('./config');
var metadata;
var env = 'development';

nunjucks.configure('./templates');
consolidate.requires.nunjucks = nunjucks

if (env == 'production') {
  metadata = config.production;
} else {
  metadata = config.development;
};

metalsmith(__dirname)
  .metadata(metadata)
  .source('./src')
  .destination('./build')
  .use(markdown())
  .use(layouts({
    engine: 'nunjucks',
    directory: 'templates'
   }))
  .build(function(err) {
    if (err) {
      throw err;
    } else {
      console.log('Build successful!');
    }
  });
