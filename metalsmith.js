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
var writemetadata = require('metalsmith-writemetadata');
var sitemap = require('metalsmith-sitemap');

// Modules
var consolidate = require('consolidate');
var nunjucks = require('nunjucks');
var dateFilter = require('nunjucks-date-filter');
var highlight = require('highlight.js');

// Local
var config = require('./config');
var globalData;

// Nunjucks configuration
dateFilter.setDefaultFormat('MMMM D, YYYY');
nunjucks.configure('./templates').addFilter('date', dateFilter);
consolidate.requires.nunjucks = nunjucks;

function build(production) {
  // Global data
  if (production) {
    globalData = config.production;
  } else {
    globalData = config.development;
  };

  // Metalsmith pipeline
  metalsmith(__dirname)
    .clean(false)
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
    .use(writemetadata({
      bufferencoding: 'utf8',
      collections: {
        posts: {
          output: {
            asObject: true,
            path: 'blog/index.json',
            metadata: {
              "type": "list"
            }
          },
          ignorekeys: ['history', 'stats', 'next', 'template', 'previous', 'collection', 'mode'],
        }
      }
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
    .build(function(err) {
      if (err) {
        throw err;
      } else {
        console.log('Build successful!');
      }
    });
}

module.exports = build;
