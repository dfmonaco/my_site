// Metalsmith
var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var collections = require('metalsmith-collections');
var branch = require('metalsmith-branch');
var permalinks = require('metalsmith-permalinks');
var drafts = require('metalsmith-drafts');
var feed = require('metalsmith-feed');
var excerpts = require('metalsmith-better-excerpts');
var pagination = require('metalsmith-pagination');
var tags = require('metalsmith-tags');
var sitemap = require('metalsmith-sitemap');
var sass = require('metalsmith-sass');
var serve = require('metalsmith-serve');

// Modules
var consolidate = require('consolidate');
var nunjucks = require('nunjucks');
var dateFilter = require('nunjucks-date-filter');
var highlight = require('highlight.js');

// Local
var config = require('./config');
var env = process.env.NODE_ENV; 
var globalData;

// Nunjucks configuration
dateFilter.setDefaultFormat('MMMM D, YYYY');
nunjucks.configure('./templates').addFilter('date', dateFilter);
consolidate.requires.nunjucks = nunjucks;

// function build(production) {
  // Global data
if (env == 'production') {
  globalData = config.production;
} else {
  globalData = config.development;
};

// Metalsmith pipeline
var siteBuild = metalsmith(__dirname)
  .metadata(globalData)
  .source('./src')
  .destination('./build')
  .use(drafts())
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
  .use(excerpts({
    pruneLength: 160
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
  .use(pagination({
    'collections.posts': {
      perPage: 10,
      layout: 'collection.html',
      first: 'blog/index.html',
      path: 'blog/:num/index.html'
    }
  }))
  .use(tags({
    handle: 'tags',
    layout: 'tags.html',
    path: 'tags/:tag/index.html',
    pathPage: 'tags/:tag/:num/index.html',
    perPage: 10,
    sortBy: 'date',
    reverse: true
  }))
  .use(layouts({
    engine: 'nunjucks',
    directory: 'templates'
  }))
  .use(sitemap({
    hostname: globalData.site.url,
    defaults: {
      lastModified: Date.now()
    },
    root: {
      lastModifed: Date.now()
    }
  }))
  .use(feed({collection: 'posts'}))
  .use(sass({
    outputDir: function(originalPath) { 
      return originalPath.replace("scss", "css");
    }
  }));

if (env != 'production') {
  siteBuild = siteBuild.use(serve({
    port: 8080,
    verbose: true
  }));
};

siteBuild.build(function(err) {
  if (err) {
    throw err;
  } else {
    console.log('Build successful!');
  }
});
