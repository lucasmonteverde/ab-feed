const router = require('express').Router();
const serveIndex = require('serve-index');

const Feed = require('controllers/feed');
const Export = require('controllers/export');
const File = require('controllers/file');

router.get('/feed/:page?', Feed);
router.get('/export', Export);
router.get('/file/*', File);
router.get('/files', serveIndex('public/files', {
	icons: true
}));

module.exports = router;