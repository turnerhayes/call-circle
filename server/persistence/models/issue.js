"use strict";

const Sequelize = require('sequelize');
const DB = require('../database-connection');
const UserModel = require('./user');
const Categories = require('../categories');

const IssueModel = DB.define('issue',
	{
		id: {
			field: 'id',
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			field: 'name',
			type: Sequelize.STRING(1000),
			allowNull: false
		},
		description: {
			field: 'description',
			type: Sequelize.TEXT,
			allowNull: false
		},
		deadline: {
			field: 'deadline',
			type: Sequelize.DATE
		},
		category: {
			field: 'category',
			type: Sequelize.ENUM(Object.keys(Categories)),
			allowNull: false
		}
	},
	{
		indexes: [
			{
				fields: ['deadline']
			},
			{
				fields: ['category']
			},
			{
				fields: [
					Sequelize.fn('lower', 'name'),
					Sequelize.fn('lower', 'description')
				]
			}
		]
	}
);

exports = module.exports = IssueModel;
