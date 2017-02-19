#!/usr/bin/nodejs

"use strict";

require("dotenv").config();

const debug = require("debug")("call-circle:server");
const http = require("http");
const fs = require("fs");
const spdy = require("spdy");
const app = require("../app");
const Config = require("../../lib/config");

app.set("port", Config.app.address.port);


if (Config.app.ssl.key && Config.app.ssl.cert) {
	const insecureServer = http.createServer(
		function(req, res) {
			// eslint-disable-next-line no-magic-numbers
			res.writeHead(301, {
				"Location": "https://" + req.headers.host.replace(
					new RegExp("\\:" + Config.app.address.insecurePort + "$"),
					":" + Config.app.address.port
				) + req.url
			});
			res.end();
		}
	).listen(
		Config.app.address.insecurePort,
		function() {
			debug("Express server listening on insecure port " + insecureServer.address().port);
		}
	);

	const options = {
		"key": fs.readFileSync(Config.app.ssl.key),
		"cert": fs.readFileSync(Config.app.ssl.cert)
	};

	const server = spdy.createServer(
		options,
		app
	).listen(
		Config.app.address.port,
		function() {
			debug("Express server listening on secure port " + server.address().port);
		}
	);
}
else {
	Config.app.address.isSecure = false;

	const server = http.createServer(
		app
	).listen(
		Config.app.address.port,
		function() {
			debug("Express server listening on port " + server.address().port);
		}
	);
}
