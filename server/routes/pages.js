const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const express = require('express');
const pageTitles = require('./utils/page-titles');
const Config = require('../../lib/config');

const router = express.Router();

const pagesDir = path.join(Config.paths.client, 'scripts', 'pages');

const jsxFilenameRegex = /\.jsx?$/;

_.each(
	fs.readdirSync(pagesDir),
	file => {
		if (jsxFilenameRegex.test(file)) {
			let strippedName = file.replace(jsxFilenameRegex, '');

			const bundleName = strippedName;

			if (strippedName === 'home') {
				strippedName = '';
			}

			router.route('/' + strippedName)
				.get(
					function(req, res) {
						res.render('page', {
							title: pageTitles[bundleName],
							req: req,
							bundleName: bundleName
						});
					}
				);
		}
	}
);

module.exports = router;
