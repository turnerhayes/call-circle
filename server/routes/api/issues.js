"use strict";

const express = require('express');
const IssuesStore = require('../../persistence/stores/issue');

const router = express.Router();

router.route('/')
	.get(
		(req, res, next) => {
			const userID = req.query.userid || req.user.id;

			const options = {
				includeUsers: req.query.include_users === "true"
			};

			if (userID) {
				IssuesStore.findByUserID(userID, options).then(
					res.json.bind(res)
				).catch(ex => next(ex));
			}
			else {
				next();
			}
		}
	).post(
		(req, res, next) => {
			if (!req.user) {
				const err = new Error('You must be logged in to create an issue');
				err.status = 403;

				next(err);
				return;
			}

			IssuesStore.createIssue(
				_.extend(
					{
						created_by: req.user
					},
					req.body
				)
			).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route('/search')
	.get(
		(req, res, next) => {
			const searchArgs = req.query;

			const options = {
				includeUsers: req.query.include_users === "true"
			};

			delete searchArgs.include_users;

			IssuesStore.searchIssues(searchArgs, options).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route('/:issueID')
	.get(
		(req, res, next) => {
			const options = {};

			options.includeUsers = req.query.include_users === "true";

			IssuesStore.findByID(req.params.issueID, options).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	).post(
		(req, res, next) => {
			const issue = req.body;

			issue.id = req.params.issueID;

			IssuesStore.updateIssue(issue).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

exports = module.exports = router;
