'use strict';

var express = require('express'),
	request = require('request'),
	logger = require('morgan'),
	compression = require('compression'),
	serveIndex = require('serve-index'),
	fs = require('fs-extra'),
	path = require('path'),
	FeedParser = require('feedparser'),
	moment = require('moment'),
	cheerio = require('cheerio'),
	archiver = require('archiver'),
	app = express();

app.use(logger('dev'));
app.use(compression());
app.use(express.static('public', {
	maxAge: 86400000
}));

app.set('views', 'views');
app.set('view engine', 'html');

app.engine('.html', require('ejs').renderFile);

app.use('/files', serveIndex('public/files', {
	icons: true
}));

var formatImageServer = function( src ){
	return /file/ + src.replace('//t', '//img').replace('thumbs/', 'images/');
};

app.get(['/','/page/:page'], function(req, res){

	var feedparser = new FeedParser(),
		feeds = [];
		
	request({
		url: process.env.SITE_URL + '/feed/',
		qs: {
			paged: req.params.page || 1
		},
		gzip: true
	})
	.on('error', function (err) {
		console.error('request error: ', err);
	})
	.on('response', function (resp) {
		var stream = this;

		if (resp.statusCode !== 200) {
			return this.emit('error', new Error('Bad status code'));
		}

		stream.pipe(feedparser);
	});

	feedparser
		.on('error', function(error) {
			console.error('feedparser error', error);
		})
		.on('readable', function() {
	
			var stream = this, item;
			while ((item = stream.read())){
				var content = cheerio.load(item.description),
					description = content('p').eq(1),
					imgCover = content('p').eq(0).find('img');
					
				content(description).remove();
				content(content('p').eq(0)).remove();
				
				var imagesFull = content('img');
				
				var images = [];
				
				/*jshint loopfunc:true */
				imagesFull.each(function(){
					images.push( formatImageServer( content(this).attr('src') ) );
				});
				
				content(imagesFull).remove();//remove parent a
				
				feeds.push({
					title: item.title,
					description: description.text(),
					link: item.link,
					categories: item.categories,
					cover: imgCover.attr('src'),
					images: images,
					date: item.pubDate,
					dateFormat: moment(item.pubDate).fromNow(),
					content: content.html(),
					comments: item['slash:comments']['#']
				});
			}
		})
		.on('end', function(){
			res.render('list',{
				feeds : feeds,
				page: req.params.page || 1
			});
		});
	
});

var headers =  {
	'User-Agent' : 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2054.3 Safari/537.36',
	'referer'	 : 'stooorage.com'
};

var API = function(res, url, filepath, filename){
	
	request({
		url: url,
		jar: true,
		followRedirect: false,
		gzip: true,
		headers: headers /*{
			referer	 : url
		}*/
	})
	.on('error', function (err) {
		console.error('request error: ', err);
	})
	.on('response', function (resp) {
		var stream = this;
		
		if (resp.statusCode !== 200){
			res.sendStatus( resp.statusCode );
			return this.emit('error', new Error('Bad status code'));
		}
		
		stream
			.pipe(fs.createOutputStream(filepath))
			.on('error', function(error) {
				console.error('response stream error', error);
			})
			.on('close', function(){
				res.redirect('/files/' + filename);
			});
	});
	
};

app.get('/file/*', function(req, res){
	
	var filename = req.params[0].split('/');
	filename = filename[ filename.length - 1 ];
	
	var filepath = path.join(__dirname, 'public/files', filename);
	
	fs.access(filepath, fs.F_OK, function(err){
		
		if( err ) {
			API( res, req.params[0], filepath, filename );
		} else {
			res.redirect('/files/' + filename);
		}
	});
	
});

app.get('/export', function(req, res){
	
	var archive = archiver('zip');
	
	archive.bulk([{
		expand: true,
		cwd: 'public/css',
		src: ['**/*']
	}]);
	
	archive.pipe(res);
	
	archive.finalize();
});

app.listen( process.env.PORT || 3000 );