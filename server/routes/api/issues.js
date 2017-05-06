"use strict";

const _                        = require("lodash");
const Promise                  = require("bluebird");
const express                  = require("express");
const sharp                    = require("sharp");
const HTTPStatusCodes          = require("http-status-codes");
const rfr                      = require("rfr");
const { mustAuthenticate }     = rfr("server/routes/utils");
const Config                   = rfr("server/lib/config");
const IssuesStore              = rfr("server/persistence/stores/issue");
const IssueImagesStore         = rfr("server/persistence/stores/issue-image");
const NotFoundException        = rfr("server/persistence/exceptions/not-found");
const AccessForbiddenException = rfr("server/persistence/exceptions/access-forbidden");

const router = express.Router();

const PNG_MIME_TYPE = "image/png";

function processIssue(req, issue) {
	const issueJSON = issue.toJSON();
	const issueUsers = issue.users;

	issueJSON.userIsSubscribed = req.user && _.size(issueUsers) > 0 &&
		issue.isUserSubscribed(req.user);

	return issueJSON;
}

function processImage(req, image) {
	return {
		"id": image.id,
		"userID": image.user_id,
		"issueID": image.issue_id,
		"location": `${req.baseUrl}/${image.issue_id}/images/${image.id}`
	};
}

function getImageFromRequest(req) {
	return new Promise(
		(resolve, reject) => {
			if (!req.busboy) {
				reject(new Error("No busboy instance on request"));
				return;
			}

			let resolved = false;

			req.busboy.on(
				"file",
				(fieldName, file, filename, encoding, mimeType) => {
					if (Config.shared.issues.images.validMimeTypes.indexOf(mimeType) < 0) {
						const err = new Error(
							"Invalid MIME type: " + mimeType +
							". Type must be one of the following: " +
							Config.shared.issues.images.validMimeTypes.join(", ")
						);

						err.status = HTTPStatusCodes.UNSUPPORTED_MEDIA_TYPE;

						reject(err);
						return;
					}

					// Convert to PNG if it's not already PNG
					if (mimeType !== PNG_MIME_TYPE) {
						file = file.pipe(sharp().png());
					}

					resolve(file);
					resolved = true;
				}
			);

			req.busboy.on(
				"finish",
				() => {
					if (!resolved) {
						resolve();
					}
				}
			);

			req.pipe(req.busboy);
		}
	);
}

router.route("/")
	.get(
		mustAuthenticate(),
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
		mustAuthenticate("You must be logged in to create an issue"),
		(req, res, next) => {
			IssuesStore.createIssue(
				_.extend(
					{
						"createdBy": req.user
					},
					req.body
				)
			).then(
				issue => res.status(HTTPStatusCodes.CREATED).location(req.baseUrl + "/" + issue.id).json(processIssue(req, issue))
			).catch(ex => next(ex));
		}
	);

router.route("/search")
	.get(
		mustAuthenticate(),
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
		mustAuthenticate(),
		(req, res, next) => {
			const options = {
				"currentUser": req.user,
				"includeUsers": req.query.includeUsers === "true"
			};


			IssuesStore.findByID(req.params.issueID, options).then(
				issue => res.set("Last-Modified", issue.updated_at).json(processIssue(req, issue))
			).catch(
				ex => {
					if (NotFoundException.isThisException(ex)) {
						next();
						return;
					}

					next(ex);
				}
			);
		}
	).post(
		mustAuthenticate("You must be logged in to update an issue"),
		(req, res, next) => {
			const issue = req.body;

			issue.id = req.params.issueID;

			const options = {
				"currentUser": req.user
			};

			IssuesStore.updateIssue(issue, options).then(
				issue => res.json(processIssue(req, issue))
			).catch(
				ex => {
					if (NotFoundException.isThisException(ex)) {
						next();
						return;
					}

					next(ex);
				}
			);
		}
	);

router.route("/:issueID/subscribe")
	.post(
		mustAuthenticate("You must be logged in to subscribe to an issue"),
		(req, res, next) => {
			IssuesStore.subscribeToIssue({
				"issueID": Number(req.params.issueID),
				"userID": req.user.id
			}).then(
				() => res.status(HTTPStatusCodes.NO_CONTENT).end()
			).catch(ex => next(ex));
		}
	);

router.route("/:issueID/unsubscribe")
	.post(
		mustAuthenticate("You must be logged in to unsubscribe from an issue"),
		(req, res, next) => {
			IssuesStore.unsubscribeFromIssue({
				"issueID": Number(req.params.issueID),
				"userID": req.user.id
			}).then(
				() => res.status(HTTPStatusCodes.NO_CONTENT).end()
			).catch(ex => next(ex));
		}
	);

router.route("/:issueID/images")
	.get(
		mustAuthenticate("You must be logged in to view images for an issue"),
		(req, res, next) => {
			const userID = Number(req.query.userid) || req.user.id;
			const issueID = req.params.issueID;

			IssueImagesStore.findIssueImages({
				issueID,
				userID
			}).then(
				images => res.json(
					images.map(
						processImage.bind(null, req)
					)
				)
			).catch(ex => next(ex));
		}
	)
	.post(
		mustAuthenticate("You must be logged in to upload an image for an issue"),
		(req, res, next) => {
			return getImageFromRequest(req).then(
				file => {
					if (!file) {
						next(new Error("No image data sent"));
						return;
					}

					const { issueID } = req.params;
					const userID = req.user.id;

					IssueImagesStore.addIssueImage({
						issueID,
						userID,
						"fileStream": file,
						"mimeType": PNG_MIME_TYPE
					}).then(
						image => res.status(HTTPStatusCodes.CREATED)
							.location(`${req.baseUrl}/${issueID}/images/${image.id}`)
							.json(processImage(req, image))
					).catch(ex => next(ex));
				}
			);
		}
	);

router.route("/:issueID/images/:imageID")
	.get(
		mustAuthenticate("You must be logged in to view an image for an issue"),
		(req, res, next) => {
			IssueImagesStore.findIssueImage({
				"imageID": req.params.imageID
			}).then(
				image => {
					res.sendFile(image.path);
				}
			).catch(
				ex => {
					if (NotFoundException.isThisException(ex)) {
						next();
						return;
					}

					next(ex);
				}
			);
		}
	)
	.delete(
		mustAuthenticate("You must be logged in to delete an image for an issue"),
		(req, res, next) => {
			if (!req.user) {
				const err = new Error();
				err.status = HTTPStatusCodes.FORBIDDEN;

				next(err);
				return;
			}

			IssueImagesStore.removeIssueImage({
				"deleteByUserID": req.user.id,
				"imageID": req.params.imageID
			}).then(
				() => res.status(HTTPStatusCodes.NO_CONTENT).end()
			).catch(
				err => {
					if (NotFoundException.isThisException(err)) {
						next();
						return;
					}

					if (AccessForbiddenException.isThisException(err)) {
						const error = new Error("You are not permitted to delete this image");
						error.status = HTTPStatusCodes.FORBIDDEN;

						next(error);
					}

					next(err);
				}
			);
		}
	);

exports = module.exports = router;
