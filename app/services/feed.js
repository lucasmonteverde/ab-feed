const Feedparser = require('feedparser');
const { parser } = require('services/parser');

function readFeed(stream) {
	return new Promise((resolve, reject) => {
		const feedparser = new Feedparser();
		const feeds = [];

		stream.pipe(feedparser)
			.on('readable', function() {
				let item;
				while ((item = this.read())) {
					feeds.push(parser(item));
				}
			})
			.on('end', () => resolve(feeds))
			.on('error', reject);
	});
}

module.exports = { readFeed };