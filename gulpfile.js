var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var watch = require('gulp-watch');

var srcFolder = './src/*.js';

gulp.task('build', function() {
    return gulp
        .src([srcFolder])
        .pipe(concat('vox.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-min', function() {
    return gulp
        .src([srcFolder])
        .pipe(uglify())
        .pipe(concat('vox.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-all', function() {
    return gulp.start('build', 'build-min');
});

gulp.task('watch', function() {
    gulp.watch(srcFolder, function(event) {
        gutil.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        gulp.run('build');
    });
});