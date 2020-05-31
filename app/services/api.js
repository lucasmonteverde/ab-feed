const axios = require('axios');
const { NotFound } = require('http-errors');

axios.defaults.headers['Accept-Encoding'] = 'gzip, deflate';
axios.defaults.headers['User-Agent'] = 'none';

const client = axios.create({
	baseURL: process.env.SITE_URL
});

function API(url, params = {}) {
	console.info('API', url);

	return client.get(url, {
		params,
		responseType: 'stream'
	})
	.catch(err => {
		const { status, config = {} } = err.response || err;
		
		if ( status === 404 ) {
			throw NotFound(config.url);
		}
		
		console.error('Error:api', err.message, config.url, config.params);
	});
}

function getFeed(paged) {
	return API('/feed/', { paged });
}

function getFile(url) {
	return API(url);
}

module.exports = { getFeed, getFile };