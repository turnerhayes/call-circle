"use strict";

const Sequelize = require('sequelize');
const Config = require('../../lib/config');

let sqlize;

const options = {
	host: Config.auth.db.host,
	dialect: 'postgres',
	define: {
		underscored: true,
		underscoredAll: true,
		paranoid: true,
		timestamps: true
	}
};

if (Config.auth.db.url) {
	sqlize = new Sequelize(
		Config.auth.db.url,
		options
	);
}
else {
	sqlize = new Sequelize(
		Config.auth.db.databaseName,
		Config.auth.db.username,
		Config.auth.db.password,
		options
	);
}

module.exports = exports = sqlize;
