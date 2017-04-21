import $ from "jquery";
import Promise from "bluebird";

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

				return user;
			}
		);
	}
}

export default UserUtils;
