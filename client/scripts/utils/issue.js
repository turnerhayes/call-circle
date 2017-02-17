import $ from "jquery";
import _ from "lodash";

function processResult(result) {
	result.created_at = result.created_at ? new Date(result.created_at) : null;
	result.updated_at = result.updated_at ? new Date(result.updated_at) : null;
	result.deleted_at = result.deleted_at ? new Date(result.deleted_at) : null;

	return result;
}

export default class IssueUtils {
	static findByID(issueID, options) {
		options = options || {};

		return $.ajax({
			url: `/api/issues/${issueID}`,
			dataType: "json",
			type: "get",
			data: {
				includeUsers: options.includeUsers
			}
		}).then(
			processResult
		).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static findByUserID(userID, options) {
		options = options || {};

		return $.ajax({
			url: "/api/issues",
			dataType: "json",
			type: "get",
			data: {
				userid: userID,
				includeUsers: options.includeUsers
			}
		}).then(
			results => results.map(processResult)
		).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static getUserIssues(userID) {
		return $.ajax({
			url: "/api/issues",
			type: "get",
			dataType: "json",
			data: {
				userid: userID
			}
		}).then(
			results => results.map(processResult)
		).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static subscribeToIssue(issue) {
		return $.ajax({
			url: `/api/issues/${issue.id}/subscribe`,
			type: "post"
		}).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		)
	}

	static createIssue(issue) {
		return $.ajax({
			url: "/api/issues",
			type: "post",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(issue)
		}).then(
			processResult
		).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static editIssue(issue) {
		return $.ajax({
			url: `/api/issues/${issue.id}`,
			type: "post",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(_.omit(issue, ['id']))
		}).then(
			processResult
		).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static saveIssue(issue) {
		if (issue.id) {
			return IssueUtils.editIssue(issue);
		}

		return IssueUtils.createIssue(issue);
	}

	static searchIssues(options) {
		return $.ajax({
			url: "/api/issues/search",
			type: "get",
			dataType: "json",
			data: options
		}).then(
			results => results.map(processResult)
		).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		)
	}

	static CATEGORY_ICON_MAP = {
		SocialJustice: 'gavel',
		CriminalJustice: 'gavel',
		Environment: 'leaf'
	}
}
