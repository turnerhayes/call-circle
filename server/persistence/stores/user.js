"use strict";

const UserModel = require("../models").User;

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

	static createUser(options = {}) {
		options.name = options.name || {};

		return UserModel.create({
			"username": options.username,
			"email": options.email,
			"firstName": options.name.first,
			"middleName": options.name.middle,
			"lastName": options.name.last,
			"displayName": options.name.display,
			"provider": options.provider,
			"providerID": options.providerID
		});
	}
}

module.exports = exports = UserStore;
