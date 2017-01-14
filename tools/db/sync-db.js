#!/usr/bin/env node

"use strict";

const debug = require('debug')('ccircle:tools:db-sync');
const DB = require('../../server/persistence/database-connection');
const UserModel = require('../../server/persistence/models/user');

const program = require('commander')
	.version(require('../../package.json').version)
	.option('-f, --force', 'Force drop tables')
	.parse(process.argv);

debug('Syncing all tables...');

DB.sync({
	force: program.force,
	logging: debug
}).then(
	() => {
		debug('Synced all tables');
	}
).catch(
	err => { throw err }
).finally(
	() => DB.close()
);
