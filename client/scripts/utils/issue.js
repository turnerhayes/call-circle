import $        from "jquery";
import { omit } from "lodash";
import Promise  from "bluebird";
import assert   from "assert";

function processResult(result) {
	result.created_at = result.created_at ? new Date(result.created_at) : null;
	result.updated_at = result.updated_at ? new Date(result.updated_at) : null;
	result.deleted_at = result.deleted_at ? new Date(result.deleted_at) : null;
	result.deadline = result.deadline ? new Date(result.deadline) : null;

	return result;
}

export default class IssueUtils {
	static findByID(issueID, options) {
		options = options || {};

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issueID}`,
				"dataType": "json",
				"type": "get",
				"data": {
					"includeUsers": options.includeUsers
				}
			}).then(
				processResult
			).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static findByUserID(userID, options) {
		options = options || {};

		return Promise.resolve(
			$.ajax({
				"url": "/api/issues",
				"dataType": "json",
				"type": "get",
				"data": {
					"userid": userID,
					"includeUsers": options.includeUsers
				}
			}).then(
				results => results.map(processResult)
			).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static getUserIssues(userID) {
		return Promise.resolve(
			$.ajax({
				"url": "/api/issues",
				"type": "get",
				"dataType": "json",
				"data": {
					"userid": userID
				}
			}).then(
				results => results.map(processResult)
			).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static subscribeToIssue(issue) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issue.id}/subscribe`,
				"type": "post"
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static unsubscribeFromIssue(issue) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issue.id}/unsubscribe`,
				"type": "post"
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static createIssue(issue) {
		return Promise.resolve(
			$.ajax({
				"url": "/api/issues",
				"type": "post",
				"dataType": "json",
				"contentType": "application/json",
				"data": JSON.stringify(issue)
			}).then(
				processResult
			).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static editIssue(issue) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issue.id}`,
				"type": "post",
				"dataType": "json",
				"contentType": "application/json",
				"data": JSON.stringify(omit(issue, ["id"]))
			}).then(
				processResult
			).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static saveIssue(issue) {
		if (issue.id) {
			return IssueUtils.editIssue(issue);
		}

		return IssueUtils.createIssue(issue);
	}

	static searchIssues(options) {
		return Promise.resolve(
			$.ajax({
				"url": "/api/issues/search",
				"type": "get",
				"dataType": "json",
				"data": options
			}).then(
				results => results.map(processResult)
			).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static uploadImage(options) {
		options = options || {};

		assert(options.issue, "'issue' argument required for uploadImage");
		assert(options.user, "'user' argument required for uploadImage");
		assert(options.file, "'file' argument required for uploadImage");

		const timestamp = new Date().toISOString();

		options.file.filename = `image-issue${options.issue.id}-${options.user.id}-${timestamp}.png`;

		const data = new FormData();

		data.append("file", options.file);

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${options.issue.id}/images`,
				"type": "post",
				"contentType": false,
				"processData": false,
				"data": data
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static CATEGORY_ICON_MAP = {
		"SocialJustice": "gavel",
		"CriminalJustice": "gavel",
		"Environment": "leaf"
	}
}
