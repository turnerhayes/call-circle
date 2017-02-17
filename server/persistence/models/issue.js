"use strict";

const _ = require('lodash');
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
		defaultScope: {
			attributes: {
				exclude: ['created_by_id']
			},
			where: {
				deleted_at: null
			},
			include: [
				{
					model: UserModel,
					as: 'createdBy'
				}
			]
		},
		scopes: {
			inProgress: {
				where: {
					$or: [
						{
							deadline: null
						},
						{
							deadline: {
								$gte: Sequelize.literal('CURRENT_TIMESTAMP')
							}
						}
					]
				}
			},
			expired: {
				where: {
					deadline: {
						$lt: Sequelize.literal('CURRENT_TIMESTAMP')
					}
				}
			},
			withUsers: function(requireUsers, userWhere) {
				return {
					include: [
						{
							model: UserModel,
							where: userWhere,
							required: requireUsers
						}
					]
				};
			}
		},
		getterMethods: {
			isExpired: function() {
				return !!(this.getDataValue('deadline') && this.getDataValue('deadline') < new Date());
			}
		},
		instanceMethods: {
			isUserSubscribed: function(user) {
				// user can either be a user ID or a user instance
				const userID = _.isNumber(user) ? user : user.id;

				return !!_.find(this.users, u => u.id === userID);
			}
		},
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
