"use strict";

const rfr                      = require("rfr");
const { isUndefined, isEmpty } = require("lodash");
const assert                   = require("assert");
const Promise                  = require("bluebird");
const path                     = require("path");
const fs                       = Promise.promisifyAll(require("fs"));
const mkdirp                   = Promise.promisify(require("mkdirp"));
const Config                   = rfr("server/lib/config");
const models                   = rfr("server/persistence/models");
const DB                       = rfr("server/persistence/database-connection");
const NotFoundException        = rfr("server/persistence/exceptions/not-found");
const AccessForbiddenException = rfr("server/persistence/exceptions/access-forbidden");

const IssueImageModel = models.IssueImage;

function _getIssueImagePath({ issueID, userID }) {
	return path.join(
		Config.uploads.images.storage.directory,
		"issues",
		issueID + "",
		userID + "",
		(Date.now()) + ".png"
	);
}

class IssueImagesStore {
	static findIssueImage({ imageID, transaction }) {
		assert(imageID, '"imageID" parameter for "findIssueImage()" is missing');

		return IssueImagesStore.findIssueImages({
			imageID,
			transaction
		}).then(
			images => {
				if (isEmpty(images)) {
					throw new NotFoundException(`Issue image ${imageID} not found`);
				}

				return images[0];
			}
		);
	}

	static findIssueImages({ imageID, userID, issueID, transaction }) {
		const where = {};

		if (!isUndefined(userID)) {
			where.user_id = userID;
		}

		if (!isUndefined(issueID)) {
			where.issue_id = issueID;
		}

		const options = {
			transaction,
			where
		};

		return isUndefined(imageID) ?
			IssueImageModel.findAll(options) :
			IssueImageModel.findById(imageID, options).then(image => [image]);
	}

	static addIssueImage({ userID, issueID, fileStream, mimeType }) {
		assert(userID, '"userID" parameter in "IssuesStore.addIssueImage()" is missing');
		assert(issueID, '"issueID" parameter in "IssuesStore.addIssueImage()" is missing');
		assert(fileStream, '"fileStream" parameter in "IssuesStore.addIssueImage()" is missing');
		assert(mimeType, '"mimeType" parameter in "IssuesStore.addIssueImage()" is missing');

		const filePath = _getIssueImagePath({userID, issueID});

		return DB.transaction(
			transaction => {
				return mkdirp(path.dirname(filePath)).then(
					() => fs.createWriteStream(filePath)
				).then(
					stream => {
						const promise = new Promise(
							(resolve, reject) => {
								stream.on(
									"finish",
									() => resolve()
								);

								stream.on(
									"error",
									reject
								);
							}
						);

						fileStream.pipe(stream);

						return promise;
					}
				).then(
					() => IssueImageModel.create(
						{
							"path": filePath,
							mimeType,
							"user_id": userID,
							"issue_id": issueID
						},
						{
							transaction
						}
					)
				);
			}
		);
	}

	static removeIssueImage({ imageID, deleteByUserID }) {
		assert(imageID, '"imageID" parameter in "IssuesStore.removeIssueImage()" is missing');
		assert(deleteByUserID, '"deleteByUserID" parameter in "IssuesStore.removeIssueImage()" is missing');

		return DB.transaction(
			transaction => {
				return IssueImagesStore.findIssueImage({
					imageID,
					transaction
				}).then(
					image => {
						if (image.user.id !== deleteByUserID) {
							throw new AccessForbiddenException(`User ${deleteByUserID} is not allowed to delete image ${imageID}`);
						}

						return fs.unlinkAsync(image.path).then(() => image);
					}
				).then(
					image => image.destroy({
						transaction
					})
				);
			}
		);
	}
}

module.exports = exports = IssueImagesStore;
