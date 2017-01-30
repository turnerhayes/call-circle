"use strict";

const Sequelize = require('sequelize');
const DB = require('../database-connection');

module.exports = exports = DB.define('tag',
	{
		name: {
			type: Sequelize.STRING(32),
			primaryKey: true
		}
	},
	{
		timestamps: false,
		paranoid: false,
	}
);
