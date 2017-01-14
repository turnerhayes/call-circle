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
		provider_id: {
			field: 'provider_id',
			type: Sequelize.STRING,
			unique: true
		},
		first_name: {
			field: 'first_name',
			type: Sequelize.STRING
		},
		middle_name: {
			field: 'middle_name',
			type: Sequelize.STRING,
		},
		last_name: {
			field: 'last_name',
			type: Sequelize.STRING
		},
		display_name: {
			field: 'display_name',
			type: Sequelize.STRING
		},
		profile_photo_url: {
			field: 'profile_photo_url',
			type: Sequelize.STRING,
			default: null,
			get: function() {
				if (this.provider === 'facebook') {
					return "https://graph.facebook.com/" + this.provider_id +"/picture?type=large";
				}
				else {
					return this.getDataValue('profile_photo_url');
				}
			}
		}
	},
	{
		timeStamps: true,
		paranoid: true,
		indexes: [
			{
				name: 'IX_users_username',
				unique: true,
				fields: ['username']
			},
			{
				name: 'IX_users_email',
				unique: true,
				fields: ['email']
			}
		]
	}
);
