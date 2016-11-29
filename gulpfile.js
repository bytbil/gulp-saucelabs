const gulp = require('gulp');
const plugins = require('gulp-load-plugins');
const test = require('./index.js')


gulp.task('default', test());
