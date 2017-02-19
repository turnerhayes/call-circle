import $ from "jquery";

let _currentUser;

class UserUtils {
	static get currentUser() {
		if (!_currentUser) {
			_currentUser = $(document.body).data("user");
		}

		return _currentUser;
	}
}

export default UserUtils;
