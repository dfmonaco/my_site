---
title: Test post 2
layout: post.html
date: 2015-07-10
author: Diego Mónaco
tags: foo bar
---

Sraasasadsaf test 2

```js
// Global data
if (env == 'production') {
  globalData = config.production;
} else {
  globalData = config.development;
};
```
Pipeline sarasa

```js
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
```
