"use strict";

const path = require('path');

const CLIENT_PATH = path.resolve(__dirname, '..', 'client');
const DIST_PATH = path.resolve(__dirname, '..', 'dist');

const ENVIRONMENT = process.env.NODE_ENV || 'development';

const Config = {
	"app": {
		"environment": ENVIRONMENT,
		"isDevelopment": ENVIRONMENT === 'development',
		"address": {
			"host": process.env.APP_ADDRESS_HOST,
			"insecurePort": process.env.APP_ADDRESS_INSECURE_PORT,
			"port": process.env.PORT || 4000,
			"isSecure": process.env.APP_SSL_KEY && process.env.APP_SSL_CERT
		},
		"ssl": {
			"key": process.env.APP_SSL_KEY,
			"cert": process.env.APP_SSL_CERT
		}
	},
	"paths": {
		"client": CLIENT_PATH,
		"dist": DIST_PATH
	},
	"auth": {
		"facebook": {
			"appId": process.env.CREDENTIALS_FACEBOOK_APP_ID,
			"appSecret": process.env.CREDENTIALS_FACEBOOK_APP_SECRET,
			"callbackURL": "/auth/fb/callback",
			"scope": [
				"public_profile",
				"email",
				"user_friends"
			]
		},
		"db": {
			"url": process.env.CREDENTIALS_DB_URL,
			"username": process.env.CREDENTIALS_DB_USERNAME,
			"password": process.env.CREDENTIALS_DB_PASSWORD,
			"databaseName": process.env.CREDENTIALS_DB_NAME,
			"host": process.env.CREDENTIALS_DB_HOST
		}
	},
	"session": {
		"secret": process.env.SESSION_SECRET,
		"db": {
			"url": process.env.SESSION_DB_URL,
			"username": process.env.SESSION_DB_USERNAME,
			"password": process.env.SESSION_DB_PASSWORD,
			"databaseName": process.env.SESSION_DB_NAME,
			"host": process.env.SESSION_DB_HOST
		}
	},
	"thirdParty": {
		"proPublica": {
			"apiKey": process.env.THIRD_PARTY_PRO_PUBLICA_API_KEY
		}
	}
};

Config.getBaseURL = function() {
	let baseURL = "http" + (Config.app.address.isSecure ? "s" : "") + "://" +
		Config.app.address.host;

	if (
		!(Config.app.address.port === 80 && !Config.app.address.isSecure) &&
		!(Config.app.address.port === 443 && Config.app.address.isSecure)
	) {
		baseURL += ':' + Config.app.address.port;
	}

	return baseURL;
};

exports = module.exports = Config;
