"use strict";

const Sequelize = require('sequelize');
const DB = require('../database-connection');

module.exports = exports = DB.define('user',
	{
		id: {
			field: 'id',
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		username: {
			field: 'username',
			type: Sequelize.STRING,
			allowNull: false,
			unique: true
		},
		email: {
			field: 'email',
			type: Sequelize.STRING,
			unique: true
		},
		provider: {
			field: 'provider',
			type: Sequelize.STRING,

		},
		providerID: {
			field: 'provider_id',
			type: Sequelize.STRING,
			unique: true
		},
		firstName: {
			field: 'first_name',
			type: Sequelize.STRING
		},
		middleName: {
			field: 'middle_name',
			type: Sequelize.STRING,
		},
		lastName: {
			field: 'last_name',
			type: Sequelize.STRING
		},
		displayName: {
			field: 'display_name',
			type: Sequelize.STRING
		},
		profilePhotoURL: {
			field: 'profile_photo_url',
			type: Sequelize.STRING,
			default: null,
			get: function() {
				if (this.provider === 'facebook') {
					return "https://graph.facebook.com/" + this.providerID +"/picture?type=large";
				}
				else {
					return this.getDataValue('profile_photo_url');
				}
			}
		}
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['username']
			},
			{
				unique: true,
				fields: ['email']
			}
		]
	}
);
