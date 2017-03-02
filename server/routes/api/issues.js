"use strict";

const _ = require("lodash");
const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");
const mkdirp = Promise.promisify(require("mkdirp"));
const express = require("express");
const Config = require("../../../lib/config");
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

router.route("/:issueID/images")
	.post(
		(req, res, next) => {
			if (!req.user) {
				const err = new Error("You must be logged in to upload an image for an issue");
				err.status = 403;

				next(err);
				return;
			}

			if (req.busboy) {
				IssuesStore.findByID(
					req.params.issueID,
					{
						"currentUser": req.user
					}
				).then(
					issue => {
						// req.busboy.on("field", function(fieldname, value, valTruncated, keyTruncated) {
						// 	console.log("on:field", keyTruncated);
						// });
						req.busboy.on(
							"file",
							(fieldName, file, filename, encoding, mimeType) => {
								console.log("processing file ", filename);
								const directory = path.join(
									Config.uploads.images.storage.directory,
									"issues",
									req.params.issueID
								);

								mkdirp(directory).then(
									() => {
										const filePath = path.join(directory, req.user.id + path.extname(filename));
										file.pipe(fs.createWriteStream(filePath));

										req.busboy.on("finish", () => {
											console.log("busboy finished");
											issue.createImage({
												"path": filePath,
												"mimeType": mimeType
											}).then(
												() => res.send("file uploaded")
											);
										});
									}
								);


							}
						);

						req.pipe(req.busboy);
					}
				).catch(
					err => {
						if (err === null) {
							next();
							return;
						}

						next(err);
					}
				);

				return;
			}

			const err = new Error("Unable to handle file upload: busboy not available on request");
			err.status = 500;

			res.next(err);
		}
	);

exports = module.exports = router;
