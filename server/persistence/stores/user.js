"use strict";

const rfr               = require("rfr");
const UserModel         = rfr("server/persistence/models").User;
const NotFoundException = rfr("server/persistence/exceptions/not-found");

class UserStore {
	static findByID(id) {
		return UserModel.findById(id);
	}

	static findByUsername(username) {
		return UserModel.findOne({
			"where": {
				"username": username
			}
		});
	}

	static findByProviderID(provider, providerID) {
		return UserModel.findOne({
			"where": {
				"provider": provider,
				"providerID": providerID
			}
		});
	}

	static createUser({ username, email, name = {}, provider, providerID } = {}) {
		return UserModel.create({
			"username": username,
			"email": email,
			"firstName": name.first,
			"middleName": name.middle,
			"lastName": name.last,
			"displayName": name.display,
			"provider": provider,
			"providerID": providerID
		});
	}

	static updateUser({ userID, updates } = {}) {
		const { location } = updates;
		const updateData = {};

		if (location) {
			updateData.location_state = location.state;
			updateData.location_district = location.district;
		}

		return UserModel.update(
			updateData,
			{
				"where": {
					"id": userID
				}
			}
		).then(
			results => {
				if (results.length === 0) {
					throw new NotFoundException(`User with ID ${userID} was not found, so it could not be updated`);
				}
			}
		);
	}
}

module.exports = exports = UserStore;
