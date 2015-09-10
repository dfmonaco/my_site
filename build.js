// Metalsmith
var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var collections = require('metalsmith-collections');
var branch = require('metalsmith-branch');
var permalinks = require('metalsmith-permalinks');

// Modules
var consolidate = require('consolidate');
var nunjucks = require('nunjucks');
var dateFilter = require('nunjucks-date-filter');
var highlight = require('highlight');

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
  .use(markdown({
    langPrefix: 'hljs ',
    highlight: function (code, lang) {
      if (lang) {
        return highlight.highlight(lang, code).value;
      } else {
        return highlight.highlightAuto(code).value;
      }
    }
  }))
  .use(layouts({
    engine: 'nunjucks',
    directory: 'templates'
   }))
  .use(
    branch(function(filename, props, i) {
      return props.collection[0] == 'posts';
    }).use(permalinks({
      pattern: 'blog/:title',
      relative: false
    }))
  )
  .use(
    branch(function(filename, props, i) {
      return props.collection[0] == 'pages';
    }).use(permalinks({
      pattern: ':title',
      relative: false
    }))
  )
  .build(function(err) {
    if (err) {
      throw err;
    } else {
      console.log('Build successful!');
    }
  });
