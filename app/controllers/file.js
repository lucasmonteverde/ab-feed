const { resolve } = require('path');
const { fileExists, writeToFile } = require('services/file');
const { getFile } = require('services/api');

async function file(req, res, next) {
	const url = req.params[0];

	if (!url) return next();

	const filename = url.split('/').pop();
	const filepath = resolve('./public/files', filename);
	
	try {
		if ( ! await fileExists(filepath) ) {
			const { data } = await getFile(url);

			await writeToFile(data, filepath);
		}
	} catch (err) {
		return next(err);
	}

	res.redirect(`/files/${filename}`);
}

module.exports = file;