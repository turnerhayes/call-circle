#!/usr/bin/env node

"use strict";

require("dotenv").config();
const debug = require("debug")("ccircle:tools:db-session");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const pg = require("pg");
const Config = require("../../lib/config");

const tableSQLPath = require.resolve("connect-pg-simple/table.sql");

fs.readFileAsync(
	tableSQLPath,
	{
		"encoding": "utf8"
	}
).then(
	sql => {
		debug("Creating session table...");

		const client = new pg.Client(Config.session.db.url);

		return client.query(sql).then(
			() => debug("Session table created")
		).catch(
			err => debug("Error creating session table: " + err.message + "\n" + err.stack)
		).finally(
			() => client.end()
		);
	}
);



