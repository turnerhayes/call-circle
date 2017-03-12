"use strict";

const Sequelize = require("sequelize");
const Loggers = require("../lib/loggers");
const Config = require("../lib/config");

module.exports = exports = new Sequelize(
	Config.auth.db.url,
	{
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
	}
);
