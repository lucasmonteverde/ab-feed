const { createWriteStream, promises } = require('fs');

function writeToFile(stream, filepath) {
	return new Promise((resolve, reject) => {
		stream.pipe(createWriteStream(filepath))
			.on('finish', () => resolve(true) )
			.on('error', reject);
	});
}

async function fileExists(path) {
	return !!(await promises.stat(path).catch(() => false));
}

module.exports = { writeToFile, fileExists };