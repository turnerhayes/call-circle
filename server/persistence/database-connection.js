"use strict";

const Sequelize = require("sequelize");
const Loggers = require("../lib/loggers");
const Config = require("../../lib/config");

let sqlize;

const options = {
	"dialect": "postgres",
	"define": {
		"underscored": true,
		"underscoredAll": true,
		"paranoid": true,
		"timestamps": true
	},
	"logging": Config.logging.sql.file === false ?
		false :
		Loggers.sql
};

if (Config.auth.db.url) {
	sqlize = new Sequelize(
		Config.auth.db.url,
		options
	);
}
else {
	options.host = Config.auth.db.host;

	sqlize = new Sequelize(
		Config.auth.db.databaseName,
		Config.auth.db.username,
		Config.auth.db.password,
		options
	);
}

module.exports = exports = sqlize;
