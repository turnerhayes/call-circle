import $          from "jquery";
import Promise    from "bluebird";
import {
	fromJS,
	Set
}                 from "immutable";
import UserRecord from "project/scripts/records/user";


// TODO: factor out of individual utils
function getErrorMessageFromXHR(jqXHR) {
	return jqXHR.responseJSON &&
	jqXHR.responseJSON.error &&
	jqXHR.responseJSON.error.message ?
		jqXHR.responseJSON.error.message :
		jqXHR.responseText;
}

class UserUtils {
	static getUser({ userID }) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/users/${userID}`,
				"type": "GET",
				"dataType": "json"
			}).then(
				user => new UserRecord(fromJS(user))
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
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
			}).then(
				updatedUser => new UserRecord(fromJS(updatedUser))
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static getSubscriptionsForUser({ userID }) {
		return Promise.resolve(
			$.ajax({
				"url": `/api/users/${userID}/subscriptions`,
				"type": "GET",
				"dataType": "json"
			}).then(
				subscriptions => Set.of(...subscriptions)
			).catch(jqXHR => getErrorMessageFromXHR(jqXHR))
		);
	}
}

export default UserUtils;
