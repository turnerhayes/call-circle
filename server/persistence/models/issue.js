"use strict";

const _          = require("lodash");
const Sequelize  = require("sequelize");
const rfr        = require("rfr");
const DB         = rfr("server/persistence/database-connection");
const UserModel  = rfr("server/persistence/models/user");
const Categories = rfr("shared-lib/categories");

const NAME_MAX_LENGTH = 1000;

const IssueModel = DB.define("issue",
	{
		"id": {
			"field": "id",
			"type": Sequelize.INTEGER,
			"allowNull": false,
			"autoIncrement": true,
			"primaryKey": true
		},
		"name": {
			"field": "name",
			"type": Sequelize.STRING(NAME_MAX_LENGTH),
			"allowNull": false
		},
		"description": {
			"field": "description",
			"type": Sequelize.TEXT,
			"allowNull": false
		},
		"deadline": {
			"field": "deadline",
			"type": Sequelize.DATE
		},
		"category": {
			"field": "category",
			"type": Sequelize.ENUM(Object.keys(Categories)),
			"allowNull": false
		}
	},
	{
		"defaultScope": {
			"attributes": {
				"exclude": ["created_by_id"]
			},
			"include": [
				{
					"model": UserModel,
					"as": "createdBy"
				}
			]
		},
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
			},
			"inProgress": {
				"where": {
					"$or": [
						{
							"deadline": null
						},
						Sequelize.where(
							Sequelize.fn("date_trunc", "day", Sequelize.col("deadline")),
							">=",
							Sequelize.fn("date_trunc", "day", Sequelize.literal("CURRENT_TIMESTAMP"))
						)
					]
				}
			},
			"expired": {
				"where": Sequelize.where(
					Sequelize.fn("date_trunc", "day", Sequelize.col("deadline")),
					">",
					Sequelize.fn("date_trunc", "day", Sequelize.literal("CURRENT_TIMESTAMP"))
				)
			}
		},
		"getterMethods": {
			"isExpired": function() {
				return !!(this.getDataValue("deadline") && this.getDataValue("deadline") < new Date());
			}
		},
		"instanceMethods": {
			"isUserSubscribed": function(user) {
				// user can either be a user ID or a user instance
				const userID = _.isNumber(user) ? user : user.id;

				return !!_.find(this.users, u => u.id === userID);
			}
		},
		"indexes": [
			{
				"fields": ["deadline"]
			},
			{
				"fields": ["category"]
			},
			{
				"fields": [
					Sequelize.fn("lower", "name"),
					Sequelize.fn("lower", "description")
				]
			}
		]
	}
);

exports = module.exports = IssueModel;
