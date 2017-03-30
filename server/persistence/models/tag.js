"use strict";

const Sequelize = require("sequelize");
const rfr       = require("rfr");
const DB        = rfr("server/persistence/database-connection");

const MAX_TAG_NAME_LENGTH = 32;

module.exports = exports = DB.define("tag",
	{
		"name": {
			"type": Sequelize.STRING(MAX_TAG_NAME_LENGTH),
			"primaryKey": true
		}
	},
	{
		"timestamps": false,
		"paranoid": false,
	}
);
