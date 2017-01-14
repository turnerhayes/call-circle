"use strict";

const Sequelize = require('sequelize');
const UserModel = require('../models/user');
const Config    = require('../../../lib/config');

class UserStore {
	static findByID(id) {
		return UserModel.findById(id);
	}

	static findByUsername(username) {
		return UserModel.findOne({
			where: {
				username: username
			}
		});
	}

	static findByProviderID(provider, providerID) {
		return UserModel.findOne({
			where: {
				provider: provider,
				provider_id: providerID
			}
		});
	}

	static createUser(options = {}) {
		options.name = options.name || {};

		return UserModel.create({
			username: options.username,
			email: options.email,
			first_name: options.name.first,
			middle_name: options.name.middle,
			last_name: options.name.last,
			display_name: options.name.display,
			provider: options.provider,
			provider_id: options.provider_id
		});
	}
}

module.exports = exports = UserStore;
