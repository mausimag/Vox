var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var watch = require('gulp-watch');

var srcFolder = './src/*.js';

gulp.task('build-base', function() {
    return gulp
        .src(['./src/*.js'])
        .pipe(concat('vox.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-base-min', function() {
    return gulp
        .src(['./src/*.js'])
        .pipe(concat('vox.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-all', function() {
    return gulp
        .src(['./src/**/*.js'])
        .pipe(concat('vox.all.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-all-min', function() {
    return gulp
        .src(['./src/**/*.js'])
        .pipe(uglify())
        .pipe(concat('vox.all.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build', function() {
    return gulp.start('build-base', 'build-base-min', 'build-all', 'build-all-min');
});

gulp.task('watch', function() {
    gulp.watch(srcFolder, function(event) {
        gutil.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        gulp.run('build');
    });
});

/***
 * Build plugins
 */