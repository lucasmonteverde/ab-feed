require('module').Module._initPaths();

const express = require('express');
const logger = require('morgan');
const compression = require('compression');
const { NotFound } = require('http-errors');
const app = express();

app.disable('x-powered-by');

app.use(logger('dev'));
app.use(compression());
app.use(express.static('public', { maxAge: '1y' }));

app.use(require('router'));

app.use((_req, _res, next) => next(NotFound()));

app.use((err, _req, res, _next) => { // eslint-disable-line no-unused-vars
	err.status = err.status || 500;

	if ( err.status >= 500 ) {
		console.error( 'App Error', err.message, err.stack );
	}
	
	res.status( err.status ).json(err);
});

app.listen( process.env.PORT || 3000 );