#!/usr/bin/env node

"use strict";

require("dotenv").config();
const _ = require("lodash");
const debug = require("debug")("ccircle:tools:db-sync");
const DB = require("../../server/persistence/database-connection");
require("../../server/persistence/models");

const program = require("commander")
	.option("-f, --force", "Force drop tables")
	.option(
		"-m, --model <modelName>",
		"Model(s) to sync (if not specified, syncs all)",
		(modelName, modelsToSync) => {
			modelsToSync.push(modelName);
			return modelsToSync;
		},
		[]
	)
	.parse(process.argv);

const SYNC_OPTIONS = {
	"force": program.force,
	"logging": debug
};

const modelsToSync = program.model;

let syncPromise;

if (modelsToSync.length > 0) {
	const missingModels = modelsToSync.reduce(
		(models, modelName) => {
			if (!DB.isDefined(modelName)) {
				models.push(modelName);
			}

			return models;
		},
		[]
	);

	if (missingModels.length > 0) {
		throw new Error("Cannot find models: " + missingModels.join(","));
	}

	syncPromise = DB.Promise.all(
		_.map(
			modelsToSync,
			(modelName) => {
				return DB.model(modelName).sync(SYNC_OPTIONS);
			}
		)
	);
}
else {
	syncPromise = DB.sync(SYNC_OPTIONS);
}

const tablesText = (
	modelsToSync.length === 0 ?
		"all tables" :
		modelsToSync.join(", ") + " tables"
);

debug("Syncing " + tablesText);

syncPromise.then(
	() => {
		debug("Synced " + tablesText);
	}
).catch(
	err => { throw err; }
).finally(
	() => DB.close()
);
