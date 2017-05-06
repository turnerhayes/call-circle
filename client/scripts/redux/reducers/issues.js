import { List, Map, fromJS } from "immutable";

import {
	FETCH_ISSUES,
	SUBSCRIPTION_CHANGE_REQUESTED,
	SUBSCRIBED_TO_ISSUE,
	UNSUBSCRIBED_FROM_ISSUE
} from "project/scripts/redux/actions";

export default function issuesReducer(state = Map(), action) {
	switch (action.type) {
		case FETCH_ISSUES: {
			if (action.error) {
				return state.set("issueLoadError", fromJS(action.payload));
			}

			return state.set(
				"items", (state.items || List()).mergeDeep(action.payload),
			).delete("issueLoadError");
		}

		case SUBSCRIPTION_CHANGE_REQUESTED: {
			return state.set("isSubscribing", true);
		}

		case SUBSCRIBED_TO_ISSUE: {
			// TODO: handle error
			let newState = state.set("isSubscribing", false);

			if (!action.error) {
				const index = state.get("items").findIndex(
					issue => issue.get("id") === action.payload.issue.get("id")
				);
				
				newState = newState.setIn(["items", index, "userIsSubscribed"], true);
			}

			return newState;
		}

		case UNSUBSCRIBED_FROM_ISSUE: {
			// TODO: handle error
			let newState = state.set("isSubscribing", false);

			if (!action.error) {
				const index = state.get("items").findIndex(
					issue => issue.get("id") === action.payload.issue.get("id")
				);

				newState = newState.setIn(["items", index, "userIsSubscribed"], false);
			}

			return newState;
		}

		default:
			return state;
	}
}
