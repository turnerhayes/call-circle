"use strict";

const _                 = require("lodash");
const assert            = require("assert");
const Sequelize         = require("sequelize");
const models            = require("../models");
const Loggers           = require("../../lib/loggers");
const NotFoundException = require("../exceptions/not-found");

const IssueModel = models.Issue;

function addUserInclude(options) {
	options = options || {};
	
	let includes = options.includes;

	if (!includes) {
		includes = [];
	}

	includes.push({
		"model": models.User,
		"where": options.where,
		"required": options.required
	});

	return includes;
}

function addCurrentUserInclude(options) {
	options = options || {};
	
	let includes = options.includes;

	if (!includes) {
		includes = [];
	}

	return addUserInclude({
		"includes": includes,
		"where": {
			// currentUser can be either a user ID or a user Instance
			"id": _.isNumber(options.currentUser) ? options.currentUser : options.currentUser.id
		},
		"required": false
	});
}

function addImageInclude(options) {
	options = options || {};
	
	let includes = options.includes;

	if (!includes) {
		includes = [];
	}

	includes.push({
		"model": models.IssueImage,
		"where": options.images.where,
		"required": options.images.required
	});

	return includes;
}

function addCreatorInclude(options) {
	options = options || {};

	let includes = options.includes;

	if (!includes) {
		includes = [];
	}

	includes.push({
		"model": models.User,
		"as": "createdBy"
	});

	return includes;
}

class IssuesStore {
	static findByID(id, options) {
		options = options || {};

		let scopes = ["defaultScope", "not-deleted"];

		const includes = [];

		addCreatorInclude({ "includes": includes });

		if (options.includeUsers) {
			addUserInclude({ "includes": includes });
		}
		else if (options.currentUser) {
			addCurrentUserInclude({
				"includes": includes,
				"currentUser": options.currentUser
			});
		}

		return IssueModel.scope(...scopes).findById(
			id,
			{
				"include": includes
			}
		).then(
			issue => {
				if (!issue) {
					throw new NotFoundException(`Issue ${id} was not found`);
				}

				return issue;
			}
		);
	}

	static findByUserID(userID, options) {
		options = options || {};

		const scopes = ["defaultScope", "not-deleted"];

		if (options.expiredOnly) {
			scopes.push("expired");
		}
		else if (!options.includeExpired) {
			scopes.push("inProgress");
		}

		const includes = [];

		addCreatorInclude({ "includes": includes });

		if (options.includeUsers) {
			addUserInclude({
				"includes": includes,
				"where": {
					"id": {
						"$in": [userID].concat(options.currentUser ? [options.currentUser.id] : [])
					}
				},
				// If we want to include all users, make this include not required. Otherwise,
				// results should require the user (and optionally the current user)
				"required": !options.includeUsers
			});
		}

		if (options.includeImages) {
			addImageInclude({
				"includes": includes
			});
		}

		return IssueModel.scope(...scopes).findAll({ "include": includes });
	}

	static createIssue(issue) {
		assert(issue, '"issue" parameter in "IssuesStore.createIssue" is missing');

		const { name, category, deadline, description, tags } = issue;

		const issueModel = IssueModel.build({
			name,
			category,
			deadline,
			description,
			tags
		});

		issueModel.setCreatedBy(issue.createdBy);

		return issueModel.save();
	}

	static updateIssue(issueData, options) {
		assert(issueData, '"issueData" parameter in "IssuesStore.updateIssue" is missing');

		options = options || {};

		return IssuesStore.findByID(issueData.id, options).then(
			issue => issue.update(issueData)
		);
	}

	static subscribeToIssue(options) {
		options = options || {};
		const { issueID, userID } = options;

		assert(issueID, '"issueID" parameter in "IssuesStore.subscribeToIssue" is missing');
		assert(userID, '"userID" parameter in "IssuesStore.subscribeToIssue" is missing');

		return IssuesStore.findByID(
			issueID,
			{
				"currentUser": userID
			}
		).then(
			issue => issue.addUser(userID).then(() => ({"userIsSubscribed": true}))
		).catch(
			err => {
				let msg;
				if (err === null) {
					msg = `Issue ${issueID} was not found`;
				}
				else {
					msg = err.msg;
				}

				Loggers.errors.error(`Error subscribing user ${userID} to issue ${issueID}: ${msg}`);
			}
		);
	}

	static unsubscribeFromIssue(options) {
		options = options || {};
		const { issueID, userID } = options;

		assert(issueID, '"issueID" parameter in "IssuesStore.unsubscribeFromIssue" is missing');
		assert(userID, '"userID" parameter in "IssuesStore.unsubscribeFromIssue" is missing');

		return IssuesStore.findByID(
			issueID,
			{
				"currentUser": userID
			}
		).then(
			issue => issue.removeUser(userID).then(() => ({"userIsSubscribed": false}))
		).catch(
			err => {
				let msg;
				if (err === null) {
					msg = `Issue ${issueID} was not found`;
				}
				else {
					msg = err.msg;
				}

				Loggers.errors.error(`Error unsubscribing user ${userID} from issue ${issueID}: ${msg}`);
			}
		);
	}

	static searchIssues(searchArgs, options) {
		const where = {};
		options = options || {};

		const scopes = ["defaultScope", "not-deleted"];

		const includes = [];

		addCreatorInclude({ "includes": includes });

		if (options.includeUsers) {
			addUserInclude({ "includes": includes });
		}
		else if (options.currentUser) {
			addCurrentUserInclude({
				"includes": includes,
				"currentUser": options.currentUser
			});
		}

		if (options.includeImages) {
			addImageInclude({ "includes": includes });
		}

		if (searchArgs.query) {
			const likeQuery = "%" + searchArgs.query.toLowerCase() + "%";
			where.$or = [
				Sequelize.where(Sequelize.fn("lower", Sequelize.col("name")), {
					"$like": likeQuery
				}),
				Sequelize.where(Sequelize.fn("lower", Sequelize.col("description")), {
					"$like": likeQuery
				})
			];
		}

		if (searchArgs.category) {
			if (_.isArray(searchArgs.category)) {
				where.category = {
					"$in": searchArgs.category
				};
			}
			else {
				where.category = {
					"$in": _.castArray(searchArgs.category)
				};
			}
		}

		return IssueModel.scope(...scopes).findAll({
			"where": where,
			"includes": includes
		});
	}
}

module.exports = exports = IssuesStore;
