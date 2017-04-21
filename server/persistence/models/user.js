"use strict";

const assert    = require("assert");
const Sequelize = require("sequelize");
const rfr       = require("rfr");
const DB        = rfr("server/persistence/database-connection");
const States    = rfr("shared-lib/states.json");

module.exports = exports = DB.define("user",
	{
		"id": {
			"field": "id",
			"type": Sequelize.INTEGER,
			"allowNull": false,
			"autoIncrement": true,
			"primaryKey": true
		},
		"username": {
			"field": "username",
			"type": Sequelize.STRING,
			"allowNull": false,
			"unique": true
		},
		"email": {
			"field": "email",
			"type": Sequelize.STRING,
			"unique": true
		},
		"provider": {
			"field": "provider",
			"type": Sequelize.STRING,

		},
		"providerID": {
			"field": "provider_id",
			"type": Sequelize.STRING,
			"unique": true
		},
		"firstName": {
			"field": "first_name",
			"type": Sequelize.STRING
		},
		"middleName": {
			"field": "middle_name",
			"type": Sequelize.STRING,
		},
		"lastName": {
			"field": "last_name",
			"type": Sequelize.STRING
		},
		"displayName": {
			"field": "display_name",
			"type": Sequelize.STRING
		},
		"profilePhotoURL": {
			"field": "profile_photo_url",
			"type": Sequelize.STRING,
			"default": null,
			"get": function() {
				if (this.provider === "facebook") {
					return "https://graph.facebook.com/" + this.providerID +"/picture?type=large";
				}
				else {
					return this.getDataValue("profile_photo_url");
				}
			}
		},
		"location_state": {
			"field": "location_state",
			"type": Sequelize.ENUM(Object.keys(States)),
			"default": null
		},
		"location_district": {
			"field": "location_district",
			"type": Sequelize.INTEGER,
			"default": null
		}
	},
	{
		"indexes": [
			{
				"unique": true,
				"fields": ["username"]
			},
			{
				"unique": true,
				"fields": ["email"]
			}
		],
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
		},
		"getterMethods": {
			"name": function name() {
				return {
					"first": this.getDataValue("firstName"),
					"middle": this.getDataValue("middleName"),
					"last": this.getDataValue("lastName"),
					"display": this.getDataValue("displayName") ||
						this.getDataValue("firstName") + " " + this.getDataValue("lastName")
				};
			},

			"location": function location() {
				return {
					"state": this.getDataValue("location_state"),
					"district": this.getDataValue("location_district")
				};
			}
		},
		"setterMethods": {
			"name": function(name) {
				assert(name.first, "value must be an object with at least a 'first' property set");

				this.setDataValue("firstName", name.first);

				if (name.middle) {
					this.setDataValue("middleName", name.middle);
				}

				if (name.last) {
					this.setDataValue("lastName", name.last);
				}

				if (name.display) {
					this.setDataValue("displayName", name.display);
				}
			}
		}
	}
);
