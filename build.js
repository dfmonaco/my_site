var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var collections = require('metalsmith-collections');

var consolidate = require('consolidate');
var nunjucks = require('nunjucks');

var config = require('./config');
var globalData;
var env = 'development';

nunjucks.configure('./templates');
consolidate.requires.nunjucks = nunjucks

if (env == 'production') {
  globalData = config.production;
} else {
  globalData = config.development;
};

metalsmith(__dirname)
  .metadata(globalData)
  .source('./src')
  .destination('./build')
  .use(collections({
    posts: {
      pattern: 'posts/*.md',
      sortBy: 'date',
      reverse: true
    },
    pages: {
      pattern: '*.md',
      sortBy: 'priority'
    }
   }))
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
