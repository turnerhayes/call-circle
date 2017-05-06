import $          from "jquery";
import Promise    from "bluebird";
import { fromJS } from "immutable";


// TODO: factor out of individual utils
function getErrorMessageFromXHR(jqXHR) {
	return jqXHR.responseJSON &&
	jqXHR.responseJSON.error &&
	jqXHR.responseJSON.error.message ?
		jqXHR.responseJSON.error.message :
		jqXHR.responseText;
}

let _currentUser;

class UserUtils {
	static get currentUser() {
		if (!_currentUser) {
			_currentUser = $(document.body).data("user");
		}

		return _currentUser;
	}

	static updateProfile({ userID, location }) {
		const data = {};

		if (location) {
			data.location = {
				"state": location.state,
				"district": location.district
			};
		}

		return Promise.resolve(
			$.ajax({
				"url": `/api/users/${userID}`,
				"type": "PATCH",
				"dataType": "json",
				data
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		).then(
			user => {
				if (UserUtils.currentUser && UserUtils.currentUser.id === userID) {
					_currentUser = user;
				}

				return fromJS(user);
			}
		);
	}

	static getSubscriptionsForUser({ userID }) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/users/${userID}/subscriptions`,
				"type": "GET",
				"dataType": "json"
			}).then(
				subscriptions => fromJS(subscriptions)
			).catch(jqXHR => getErrorMessageFromXHR(jqXHR))
		);
	}
}

export default UserUtils;
