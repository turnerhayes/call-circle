"use strict";

const Sequelize = require("sequelize");
const DB = require("../database-connection");

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
