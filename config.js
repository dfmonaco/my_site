var config = {
  production: {
    baseUrl: process.env.BASE_URL || '', 
    site: {
      url: process.env.SITE_URL || 'https://dfmonaco.github.io',
      title: 'Diego Mónaco',
      comments: true,
      disqus: process.env.DISQUS || 'example',
      googleAnalytics: process.env.GOOGLE_ANALYTICS || '123456789'
    }
  },
  development: {
    baseUrl: process.env.DEV_BASE_URL || '',
    site: {
      url: process.env.DEV_SITE_URL || 'http://localhost:8000',
      title: 'Diego Mónaco',
      comments: true,
      disqus: process.env.DEV_DISQUS || 'staging-example',
      googleAnalytics: process.env.DEV_GOOGLE_ANALYTICS || false
    }
  }
};

module.exports = config;

