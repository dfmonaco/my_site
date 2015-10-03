var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var connect = require('gulp-connect');
var metalsmithBuild = require('./metalsmith');
var ghPages = require('gulp-gh-pages');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var modularscale = require('./node_modules/modularscale-sass/eyeglass-exports.js')();

// Clean up build
gulp.task('clean', function (cb) {
  return del(['build'], cb);
});

// Images
var images = function() {
  return gulp.src('assets/images/**/*')
    .pipe(gulp.dest('build/images'))
    .pipe(connect.reload());
};

gulp.task('images', ['clean'], images);
gulp.task('images-watch', images);

// Styles
var styles = function() {
  return gulp.src('assets/scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [].concat(modularscale.sassDir)
    }).on('error', sass.logError))
    .pipe(gulp.dest('build/css'))
    .pipe(connect.reload());
};

gulp.task('styles', ['clean'], styles);
gulp.task('styles-watch', styles);

// Javascript
var scripts = function() {
  return gulp.src('assets/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(connect.reload());
};

gulp.task('scripts', ['clean'], scripts);
gulp.task('scripts-watch', scripts);

// Deploy to gh pages
gulp.task('deploy', ['build:prod'], function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});

// Local server
gulp.task('server', function () {
  connect.server({
    root: ['build'],
    port: 8000,
    livereload: true,
    middleware: function(connect, opt) {
      return [
      connect.static('build'),
      function(req, res, next) {
        var file = fs.readFileSync('./build/404.html');
        res.statusCode = 404;
        res.end(file);
      }];
    }
  });
});

// Metalsmith build
var metalsmith = function(){
  metalsmithBuild();
};

gulp.task('metalsmith', ['clean'], metalsmith);
gulp.task('metalsmith-watch', metalsmith);

var metalsmithProd = function(){
  metalsmithBuild(true);
};

gulp.task('metalsmith:prod', ['clean'], metalsmithProd);
gulp.task('metalsmith:prod-watch', metalsmithProd);

// Watch
gulp.task('watch', function () {
  gulp.watch('assets/images/*', ['images-watch']);
  gulp.watch('assets/js/**/*.js', ['scripts-watch']);
  gulp.watch('assets/scss/**/*.scss', ['styles-watch']);
  gulp.watch(['src/**/*.html', 'src/**/*.md', 'templates/**/*.html'], ['metalsmith-watch']);
});

gulp.task('watch:prod', function () {
  gulp.watch('assets/images/*', ['images-watch']);
  gulp.watch('assets/js/**/*.js', ['scripts-watch']);
  gulp.watch('assets/scss/**/*.scss', ['styles-watch']);
  gulp.watch(['src/**/*.html', 'src/**/*.md', 'templates/**/*.html'], ['metalsmith:prod-watch']);
});

// Tasks
gulp.task('build', ['images', 'styles', 'scripts', 'metalsmith']);
gulp.task('build:prod', ['images', 'styles', 'scripts', 'metalsmith:prod']);
gulp.task('preview', ['watch', 'build:prod', 'server']);
gulp.task('default', ['watch', 'build', 'server']);

