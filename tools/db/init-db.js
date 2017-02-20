#!/usr/bin/env node

"use strict";

require("dotenv").config();
const debug = require("debug")("ccircle:tools:db-init");
const DB = require("../../server/persistence/database-connection");
require("../../server/persistence/models");

const program = require("commander")
	.option("-f, --force", "Force drop tables")
	.parse(process.argv);

debug("Syncing database...");

DB.sync({
	"force": program.force,
	"logging": debug
}).then(
	() => debug("Database synced")
).catch(
	err => debug("Error syncing database: " + err.message + "\n" + err.stack)
).finally(
	() => DB.close()
);
