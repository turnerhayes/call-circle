"use strict";

const Sequelize = require("sequelize");
const DB = require("../database-connection");

const PATH_MAX_LENGTH = 1000;
const MIME_TYPE_MAX_LENGTH = 1000;

const IssueImageModel = DB.define("issueImage",
	{
		"id": {
			"field": "id",
			"type": Sequelize.INTEGER,
			"autoIncrement": true,
			"primaryKey": true
		},

		"path": {
			"field": "path",
			"type": Sequelize.STRING(PATH_MAX_LENGTH),
			"allowNull": false
		},

		"mimeType": {
			"field": "mime_type",
			"type": Sequelize.STRING(MIME_TYPE_MAX_LENGTH),
			"allowNull": false
		}
	},
	{
		"scopes": {
			"not-deleted": {
				"where": {
					"deleted_at": null
				}
			},
			"deleted": {	
				"where": {
					"deleted_at": {
						"$ne": null
					}
				}
			}
		}
	}
);

exports = module.exports = IssueImageModel;
