"use strict";

const _         = require('lodash');
const Sequelize = require('sequelize');
const models    = require('../models');

const IssueModel = models.Issue;

function getFindOptions(args) {
	args = args || {};

	const options = {
		attributes: {
			exclude: ['created_by_id']
		},
		where: Object.assign(
			{
				deleted_at: null
			},
			args.issueWhere || {}
		),
		include: [
			{
				model: models.Tag,
				as: 'tags'
			}
		]
	};

	if (args.includeUsers) {
		options.include.push(
			{
				model: models.User,
				as: 'created_by'
			},
			{
				model: models.User,
				where: Object.assign(
					{
						deleted_at: null
					},
					args.userWhere || {}
				),
				required: !!args.onlyIssuesWithUsers
			}
		);
	}

	return options;
}

class IssuesStore {
	static findByID(id, options) {
		return IssueModel.findById(
			id,
			getFindOptions({
				includeUsers: options.includeUsers
			})
		).then(
			issue => issue || Sequelize.Promise.reject(null)
		);
	}

	static findByUserID(userID) {
		return IssueModel.findAll(
			getFindOptions({
				includeUsers: true,
				onlyIssuesWithUsers: true,
				userWhere: {
					id: userID
				}
			})
		);
	}

	static createIssue(issue) {
		if (!issue) {
			throw new Error('"issue" parameter in "IssuesStore.createIssue" is missing');
		}

		const { name, category, deadline, description, created_by, tags } = issue;

		return IssueModel.create({
			name,
			category,
			deadline,
			description,
			created_by,
			tags
		});
	}

	static updateIssue(issueData, options) {
		if (!issueData) {
			throw new Error('"issueData" parameter in "IssuesStore.updateIssue" is missing');
		}

		options = options || {};

		return IssuesStore.findByID(issueData.id, options).then(
			issue => {
				return issue.update(issueData);
			}
		);
	}

	static searchIssues(searchArgs, options) {
		const where = {};
		options = options || {};

		if (searchArgs.query) {
			const likeQuery = '%' + searchArgs.query.toLowerCase() + '%';
			where.$or = [
				Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {
					$like: likeQuery
				}),
				Sequelize.where(Sequelize.fn('lower', Sequelize.col('description')), {
					$like: likeQuery
				})
			];
		}

		if (searchArgs.category) {
			if (_.isArray(searchArgs.category)) {
				where.category = {
					$in: searchArgs.category
				};
			}
			else {
				where.category = {
					$in: _.castArray(searchArgs.category)
				};
			}
		}

		return IssueModel.findAll(
			getFindOptions({
				issueWhere: where,
				includeUsers: options.includeUsers
			})
		);
	}
}

module.exports = exports = IssuesStore;
