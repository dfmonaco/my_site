var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

// Deploy to gh pages
gulp.task('deploy', function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});
