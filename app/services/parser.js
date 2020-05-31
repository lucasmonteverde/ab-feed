const cheerio = require('cheerio');
const { formatDistance } = require('date-fns');

const formatImageServer = src => `/file/${src.replace('//t', '//img').replace('thumbs/', 'images/')}`;

function parser(item) {
	const $ = cheerio.load(item.description);
	const lines = $('p');

	const imgCover = lines.eq(0).find('img');
	const description = lines.eq(1);
		
	$(lines.eq(0)).remove();
	$(description).remove();
	
	const imagesFull = $('img');
	
	const images = imagesFull.map((i, el) =>
		formatImageServer( $(el).attr('src') ))
		.get();
	
	$(imagesFull).remove(); //remove parent a
	
	return {
		title: item.title,
		description: description.text(),
		link: item.link,
		categories: item.categories,
		cover: imgCover.attr('src'),
		images: images,
		date: item.pubDate,
		dateFormat: formatDistance(item.pubDate, new Date()),
		content: $.html(),
		comments: +item['slash:comments']['#']
	};
}

module.exports = { parser };