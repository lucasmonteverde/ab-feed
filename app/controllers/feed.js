const { getFeed } = require('services/api');
const { readFeed } = require('services/feed');

const list = new Map();

async function feed(req, res, next) {
	const page = req.params.page || 1;

	let feeds = list.get(page);
	
	try {
		if ( !feeds ) {
			const { data } = await getFeed(page);

			feeds = await readFeed(data);

			list.set(page, feeds);
		}
	} catch (err) {
		next(err);
	}

	res.set('x-page', page).json(feeds);
}

module.exports = feed;