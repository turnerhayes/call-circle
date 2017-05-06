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

export function toggleIssueSubscription({ issue }) {
	if (issue.get("userIsSubscribed")) {
		return unsubscribeFromIssue({ issue });
	}

	return subscribeToIssue({ issue });
}

export const GET_SUBSCRIPTIONS_FOR_USER = "USER_GET_SUBSCRIPTIONS";

export function getSubscriptionsForUser({ userID }) {
	return {
		"type": GET_SUBSCRIPTIONS_FOR_USER,
		"payload": UserUtils.getSubscriptionsForUser({ userID })
	};
}

export const SHOW_ISSUE = "ISSUES_ISSUE_SHOW";

export function showIssue({ issueID }) {
	return {
		"type": SHOW_ISSUE,
		"payload": {
			issueID
		}
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
