var gulp = require('gulp'),
	nodemon = require('gulp-nodemon'),
	jshint = require('gulp-jshint');
	
require('dotenv').load();

gulp.task('lint', function () {
	return gulp.src(['server.js', './app/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
})

gulp.task('express', function () {
	return nodemon({ 
			script: 'server.js', 
			ext: 'html js', 
			ignore: ['src/**', 'public/**', 'node_modules/**'],
			//nodeArgs: ['--debug']
		})
		.on('change', ['lint'])
		.on('restart', function () {
			gulp.start('lint');
			console.log('restarted!');
		});
})

gulp.task('default', [ 'express', 'lint' ]);