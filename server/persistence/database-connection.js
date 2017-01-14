"use strict";

require('dotenv').config();
const Sequelize = require('sequelize');
const Config = require('../../lib/config');

let sqlize;

if (Config.auth.db.url) {
	sqlize = new Sequelize(
		Config.auth.db.url,
		{
			host: Config.auth.db.host,
			dialect: 'postgres'
		}
	);
}
else {
	sqlize = new Sequelize(
		Config.auth.db.databaseName,
		Config.auth.db.username,
		Config.auth.db.password,
		{
			host: Config.auth.db.host,
			dialect: 'postgres'
		}
	);
}

module.exports = exports = sqlize;
