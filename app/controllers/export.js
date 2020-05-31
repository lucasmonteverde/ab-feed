const archiver = require('archiver');

function exporter(req, res, next) {
	try {
		const archive = archiver('zip');

		archive.directory('public/files', false);

		archive.pipe(res);

		archive.finalize();
	} catch ( err) {
		next (err);
	}
}

module.exports = exporter;