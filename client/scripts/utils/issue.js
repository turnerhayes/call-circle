import $          from "jquery";
import { omit }   from "lodash";
import {
	List,
	fromJS
} from "immutable";
import Promise    from "bluebird";
import assert     from "assert";

function processResult(result) {
	result.created_at = result.created_at ? new Date(result.created_at) : null;
	result.updated_at = result.updated_at ? new Date(result.updated_at) : null;
	result.deleted_at = result.deleted_at ? new Date(result.deleted_at) : null;
	result.deadline = result.deadline ? new Date(result.deadline) : null;

	return fromJS(result);
}

function getErrorMessageFromXHR(jqXHR) {
	return jqXHR.responseJSON &&
	jqXHR.responseJSON.error &&
	jqXHR.responseJSON.error.message ?
		jqXHR.responseJSON.error.message :
		jqXHR.responseText;
}

export default class IssueUtils {
	static findByID({ issueID, includeUsers = false }) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issueID}`,
				"dataType": "json",
				"type": "get",
				"data": {
					"includeUsers": includeUsers
				}
			}).then(
				processResult
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static findByUserID({ userID, includeUsers = false }) {
		return Promise.resolve(
			$.ajax({
				"url": "/api/issues",
				"dataType": "json",
				"type": "get",
				"data": {
					"userid": userID,
					"includeUsers": includeUsers
				}
			}).then(
				results => List(results.map(processResult))
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static subscribeToIssue({ issue }) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issue.get("id")}/subscribe`,
				"type": "post"
			}).then(
				() => issue
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static unsubscribeFromIssue({ issue }) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issue.get("id")}/unsubscribe`,
				"type": "post"
			}).then(
				() => issue
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static createIssue({ issue }) {
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
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static editIssue({ issue }) {
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
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static saveIssue({ issue }) {
		if (issue.id) {
			return IssueUtils.editIssue({issue});
		}

		return IssueUtils.createIssue({issue});
	}

	static searchIssues({ searchOptions }) {
		return Promise.resolve(
			$.ajax({
				"url": "/api/issues/search",
				"type": "get",
				"dataType": "json",
				"data": searchOptions
			}).then(
				results => results.map(processResult)
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
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
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
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
