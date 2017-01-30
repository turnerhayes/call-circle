import $ from "jquery";
import _ from "lodash";

function processResult(result) {
	result.created_at = result.created_at ? new Date(result.created_at) : null;
	result.updated_at = result.updated_at ? new Date(result.updated_at) : null;
	result.deleted_at = result.deleted_at ? new Date(result.deleted_at) : null;

	return result;
}

export default class IssueUtils {
	static findByID(issueID) {
		return $.ajax({
			url: `/api/issues/${issueID}`,
			dataType: "json",
			type: "get",
			data: {
				include_users: true
			}
		}).then(
			processResult,
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static findByUserID(userID) {
		return $.ajax({
			url: "/api/issues",
			dataType: "json",
			type: "get",
			data: {
				userID
			}
		}).then(
			results => results.map(processResult),
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static createIssue(issue) {
		return $.ajax({
			url: "/api/issues",
			type: "post",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(issue)
		}).then(
			processResult,
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
			processResult,
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static searchIssues(options) {
		return $.ajax({
			url: "/api/issues/search",
			type: "get",
			dataType: "json",
			data: options
		}).then(
			results => results.map(processResult),
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
