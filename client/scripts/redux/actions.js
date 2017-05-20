import {
	push
}                        from "react-router-redux";
import UserUtils         from "project/scripts/utils/user";
import IssueUtils        from "project/scripts/utils/issue";
import IssueImageUtils   from "project/scripts/utils/issue-image";
import CongressDataUtils from "project/scripts/utils/congress-data";

export const SUBSCRIPTION_CHANGE_REQUESTED = "ISSUES_SUBSCRIPTION_CHANGE_REQUESTED";

export const SUBSCRIBED_TO_ISSUE = "ISSUES_ISSUE_SUBSCRIBE";

function subscriptionChangeRequested(subscribed) {
	return {
		"type": SUBSCRIPTION_CHANGE_REQUESTED,
		"payload": {
			subscribed
		}
	};
}

export function subscribeToIssue({ issue }) {
	return dispatch => {
		dispatch(subscriptionChangeRequested(true));

		IssueUtils.subscribeToIssue({ issue }).then(
			() => dispatch({
				"type": SUBSCRIBED_TO_ISSUE,
				"payload": {
					issue
				}
			})
		).catch(
			err => dispatch({
				"type": SUBSCRIBED_TO_ISSUE,
				"error": true,
				"payload": err
			})
		);
	};
}

export const UNSUBSCRIBED_FROM_ISSUE = "ISSUES_ISSUE_UNSUBSCRIBE";

export function unsubscribeFromIssue({ issue }) {
	return dispatch => {
		dispatch(subscriptionChangeRequested(false));

		IssueUtils.unsubscribeFromIssue({ issue }).then(
			() => dispatch({
				"type": UNSUBSCRIBED_FROM_ISSUE,
				"payload": {
					issue
				}
			})
		).catch(
			err => dispatch({
				"type": UNSUBSCRIBED_FROM_ISSUE,
				"error": true,
				"payload": err
			})
		);
	};
}

export const GET_SUBSCRIPTIONS_FOR_USER = "USER_GET_SUBSCRIPTIONS";

export function getSubscriptionsForUser({ userID }) {
	return {
		"type": GET_SUBSCRIPTIONS_FOR_USER,
		"payload": UserUtils.getSubscriptionsForUser({ userID })
	};
}

export const FETCH_ISSUES = "ISSUES_FETCH";

export function fetchIssuesForUser({ userID }) {
	return {
		"type": FETCH_ISSUES,
		"payload": IssueUtils.findByUserID({userID})
	};
}

export function fetchIssueByID({ issueID }) {
	return {
		"type": FETCH_ISSUES,
		"payload": IssueUtils.findByID({issueID}).then(issue => issue ? [issue] : issue)
	};
}

export const CREATE_ISSUE = "ISSUES_CREATE";

export function createIssue(issueData, { redirectOnSuccess }) {
	return dispatch => {
		let promise = IssueUtils.createIssue({"issue": issueData});

		if (redirectOnSuccess) {
			promise = promise.then(
				issue => dispatch(push(`/issues/${issue.id}`))
			);
		}

		return {
			"type": CREATE_ISSUE,
			"payload": promise
		};
	};
}

export const EDIT_ISSUE = "ISSUES_EDIT";

export function editIssue(issueData, { redirectOnSuccess }) {
	return dispatch => {
		let promise = IssueUtils.editIssue({"issue": issueData});

		if (redirectOnSuccess) {
			promise = promise.then(
				issue => {
					dispatch(push(`/issues/${issue.id}`));
				}
			);
		}

		return {
			"type": EDIT_ISSUE,
			"payload": promise
		};
	};
}

export const CHANGE_ISSUE_SEARCH_PARAMETERS = "ISSUES_SEARCH_CHANGE_PARAMETERS";

export function changeIssueSearchParamters(parameters) {
	return {
		"type": CHANGE_ISSUE_SEARCH_PARAMETERS,
		"payload": parameters
	};
}

export const SEARCH_ISSUES = "ISSUES_SEARCH";

export function searchIssues({ searchOptions }) {
	return {
		"type": SEARCH_ISSUES,
		"payload": IssueUtils.searchIssues({ searchOptions })
	};
}

export const FETCH_ISSUE_IMAGES = "ISSUE_IMAGES_FETCH";

export function fetchIssueImages({ issueID, userID = null }) {
	return {
		"type": FETCH_ISSUE_IMAGES,
		"payload": IssueImageUtils.getImages({
			issueID,
			userID
		})
	};
}

export const UPLOAD_ISSUE_IMAGE = "ISSUE_IMAGE_UPLOAD";

export function uploadIssueImage({ issueID, file }) {
	return {
		"type": UPLOAD_ISSUE_IMAGE,
		"payload": IssueImageUtils.uploadImage({
			issueID, file
		})
	};
}

export const DELETE_ISSUE_IMAGE = "ISSUE_IMAGE_DELETE";

export function deleteIssueImage({ image }) {
	return {
		"type": DELETE_ISSUE_IMAGE,
		"payload": IssueImageUtils.deleteImage({ image })
	};
}

export const GET_CONGRESSIONAL_REPRESENTATIVES = "CONGRESS_GET_REPRESENTATIVES";

export function getCongressionalRepresentatives({ state, district }) {
	return {
		"type": GET_CONGRESSIONAL_REPRESENTATIVES,
		"payload": CongressDataUtils.getMemberInfo({ state, district })
	};
}

export const GET_CONGRESSIONAL_DISTRICTS = "CONGRESS_GET_DISTRICTS";

export function getAllUSDistricts() {
	return {
		"type": GET_CONGRESSIONAL_DISTRICTS,
		"payload": CongressDataUtils.getDistricts()
	};
}

export const GET_USER = "USERS_GET";

export function getUser({ userID }) {
	return {
		"type": GET_USER,
		"payload": UserUtils.getUser({ userID })
	};
}

export const UPDATE_USER_PROFILE = "USERS_UPDATE_USER_PROFILE";

export function updateUserProfile({ userID, location }) {
	return {
		"type": UPDATE_USER_PROFILE,
		"payload": UserUtils.updateProfile({
			userID,
			location
		})
	};
}
