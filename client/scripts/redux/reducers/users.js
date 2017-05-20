import { Set } from "immutable";
import UsersStateRecord from "project/scripts/records/state/users";
import {
	GET_USER,
	UPDATE_USER_PROFILE,
	GET_SUBSCRIPTIONS_FOR_USER,
	SUBSCRIPTION_CHANGE_REQUESTED,
	SUBSCRIBED_TO_ISSUE,
	UNSUBSCRIBED_FROM_ISSUE
}                    from "project/scripts/redux/actions";

export default function usersReducer(state = new UsersStateRecord(), action) {
	switch (action.type) {
		case GET_USER: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(["items", action.payload.id], action.payload);
		}

		case UPDATE_USER_PROFILE: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(["items", action.payload.id], action.payload);
		}

		case GET_SUBSCRIPTIONS_FOR_USER: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.set("subscriptions", action.payload);
		}


		case SUBSCRIPTION_CHANGE_REQUESTED: {
			return state.set("isChangingSubscription", true);
		}

		case SUBSCRIBED_TO_ISSUE: {
			let newState = state.set("isChangingSubscription", false);

			if (action.error) {
				// TODO: handle error
				return newState;
			}

			return newState.updateIn(
				["subscriptions"],
				Set(),
				subscriptions => subscriptions.add(action.payload.issue.id)
			);
		}

		case UNSUBSCRIBED_FROM_ISSUE: {
			let newState = state.set("isChangingSubscription", false);

			if (action.error) {
				// TODO: handle error
				return newState;
			}

			return newState.updateIn(
				["subscriptions"],
				subscriptions => subscriptions.delete(action.payload.issue.id)
			);
		}


		default:
			return state;
	}
}
