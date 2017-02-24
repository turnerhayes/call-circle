"use strict";

const _         = require("lodash");
const assert    = require("assert");
const Sequelize = require("sequelize");
const models    = require("../models");
const Loggers   = require("../../lib/loggers");

const IssueModel = models.Issue;

function getCurrentUserScope(currentUser) {
	return {
		"method": [
			"withUsers",
			false,
			{
				"id": currentUser.id
			}
		]
	};
}

const queryOptions = {
	"include": [
		{
			"model": models.User,
			"as": "createdBy"
		}
	]
};

class IssuesStore {
	static reload(issue) {
		assert(issue, 'Must provide an issue model instance to "reload"');

		return issue.reload();
	}

	static findByID(id, options) {
		options = options || {};

		let scopes = ["defaultScope"];

		if (options.includeUsers) {
			scopes.push({
				"method": [
					"withUsers",
					false
				]
			});
		}
		else if (options.currentUser) {
			scopes.push(getCurrentUserScope(options.currentUser));
		}

		return IssueModel.scope(...scopes).findById(
			id,
			queryOptions
		).then(
			issue => issue || Sequelize.Promise.reject(null)
		);
	}

	static findByUserID(userID, options) {
		options = options || {};

		const scopes = ["defaultScope"];

		if (options.expiredOnly) {
			scopes.push("expired");
		}
		else if (!options.includeExpired) {
			scopes.push("inProgress");
		}

		scopes.push({
			"method": [
				"withUsers",
				// If we want to include all users, make this include not required. Otherwise,
				// results should require the user (and optionally the current user)
				!options.includeUsers,
				{
					"id": {
						"$in": [userID].concat(options.currentUser ? [options.currentUser.id] : [])
					}
				}
			]
		});

		return IssueModel.scope(...scopes).findAll(queryOptions);
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
		delete options.issueID;
		delete options.userID;

		assert(issueID, '"issueID" parameter in "IssuesStore.unsubscribeFromIssue" is missing');
		assert(userID, '"userID" parameter in "IssuesStore.unsubscribeFromIssue" is missing');

		return IssuesStore.findByID(
			issueID,
			{
				"currentUser": userID
			}
		).then(
			issue => issue.addUser(userID).then(() => IssuesStore.reload(issue))
		).catch(
			err => Loggers.error.error(`Error subscribing user ${userID} to issue ${issueID}: ${err.message}`)
		);
	}

	static unsubscribeFromIssue(options) {
		options = options || {};
		const { issueID, userID } = options;
		delete options.issueID;
		delete options.userID;

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
			err => Loggers.error.error(`Error unsubscribing user ${userID} from issue ${issueID}: ${err.message}`)
		);
	}

	static searchIssues(searchArgs, options) {
		const where = {};
		options = options || {};

		const scopes = ["defaultScope"];

		if (options.includeUsers) {
			scopes.push("withUsers");
		}
		else if (options.currentUser) {
			scopes.push(getCurrentUserScope(options.currentUser));
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

		const opts = Object.assign(
			{
				"where": where
			},
			queryOptions
		);

		return IssueModel.scope(...scopes).findAll(opts);
	}
}

module.exports = exports = IssuesStore;
