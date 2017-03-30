"use strict";

const Sequelize = require("sequelize");
const rfr       = require("rfr");
const Loggers   = rfr("server/lib/loggers");
const Config    = rfr("server/lib/config");

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
