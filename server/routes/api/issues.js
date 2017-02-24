"use strict";

const _ = require("lodash");
const express = require("express");
const IssuesStore = require("../../persistence/stores/issue");

const router = express.Router();

function processIssue(req, issue) {
	const issueJSON = issue.toJSON();
	const issueUsers = issue.users;

	issueJSON.userIsSubscribed = req.user && _.size(issueUsers) > 0 &&
		issue.isUserSubscribed(req.user);

	return issueJSON;
}

router.route("/")
	.get(
		(req, res, next) => {
			const userID = req.query.userid || req.user.id;

			const options = {
				"currentUser": req.user,
				"includeUsers": req.query.includeUsers === "true",
				"includeExpired": req.query.includeExpired === "true",
				"expiredOnly": req.query.expiredOnly === "true"
			};

			if (userID) {
				IssuesStore.findByUserID(userID, options).then(
					issues => res.json(issues.map(processIssue.bind(null, req)))
				).catch(ex => next(ex));
			}
			else {
				next();
			}
		}
	).post(
		(req, res, next) => {
			if (!req.user) {
				const err = new Error("You must be logged in to create an issue");
				err.status = 403;

				next(err);
				return;
			}

			IssuesStore.createIssue(
				_.extend(
					{
						"createdBy": req.user
					},
					req.body
				)
			).then(
				// eslint-disable-next-line no-magic-numbers
				issue => res.status(201).location(req.baseUrl + "/" + issue.id).json(processIssue(req, issue))
			).catch(ex => next(ex));
		}
	);

router.route("/search")
	.get(
		(req, res, next) => {
			const searchArgs = req.query;

			const options = {
				"currentUser": req.user,
				"includeUsers": req.query.includeUsers === "true"
			};

			delete searchArgs.include_users;

			IssuesStore.searchIssues(searchArgs, options).then(
				issues => res.json(issues.map(processIssue.bind(null, req)))
			).catch(ex => next(ex));
		}
	);

router.route("/:issueID")
	.get(
		(req, res, next) => {
			const options = {
				"currentUser": req.user,
				"includeUsers": req.query.includeUsers === "true"
			};


			IssuesStore.findByID(req.params.issueID, options).then(
				issue => res.set("Last-Modified", issue.updated_at).json(processIssue(req, issue))
			).catch(ex => next(ex));
		}
	).post(
		(req, res, next) => {
			const issue = req.body;

			issue.id = req.params.issueID;

			const options = {
				"currentUser": req.user
			};

			IssuesStore.updateIssue(issue, options).then(
				issue => res.json(processIssue(req, issue))
			).catch(ex => next(ex));
		}
	);

router.route("/:issueID/subscribe")
	.post(
		(req, res, next) => {
			if (!req.user) {
				const err = new Error("You must be logged in to subscribe to an issue");
				err.status = 403;

				next(err);
				return;
			}

			IssuesStore.subscribeToIssue({
				"issueID": Number(req.params.issueID),
				"userID": req.user.id
			}).then(
				() => res.json({
					"success": true
				})
			).catch(ex => next(ex));
		}
	);

router.route("/:issueID/unsubscribe")
	.post(
		(req, res, next) => {
			if (!req.user) {
				const err = new Error("You must be logged in to unsubscribe from an issue");
				err.status = 403;

				next(err);
				return;
			}

			IssuesStore.unsubscribeFromIssue({
				"issueID": Number(req.params.issueID),
				"userID": req.user.id
			}).then(
				() => res.json({
					"success": true
				})
			).catch(ex => next(ex));
		}
	);

exports = module.exports = router;
