// Metalsmith
var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var collections = require('metalsmith-collections');

// Modules
var consolidate = require('consolidate');
var nunjucks = require('nunjucks');
var dateFilter = require('nunjucks-date-filter');

// Local
var config = require('./config');
var globalData;
var env = 'development';

// Global data
if (env == 'production') {
  globalData = config.production;
} else {
  globalData = config.development;
};

// Nunjucks configuration
dateFilter.setDefaultFormat('MMMM D, YYYY');
nunjucks.configure('./templates').addFilter('date', dateFilter);
consolidate.requires.nunjucks = nunjucks;

// Metalsmith pipeline
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
