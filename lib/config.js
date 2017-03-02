const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const CLIENT_PATH = path.join(PROJECT_ROOT, "client");
const DIST_PATH = path.join(PROJECT_ROOT, "dist");

const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

const DEFAULT_PORT = 4000;

const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const HTTP_DEFAULT_PORT = 80;
const HTTPS_DEFAULT_PORT = 443;

function getConnectionString(args) {
	return "postgresql://" + args.username + ":" + args.password +
		"@" + args.host + "/" + args.databaseName;
}

const DB_URL = process.env.CREDENTIALS_DB_URL ||
	getConnectionString({
		"username": process.env.CREDENTIALS_DB_USERNAME,
		"password": process.env.CREDENTIALS_DB_PASSWORD,
		"databaseName": process.env.CREDENTIALS_DB_NAME,
		"host": process.env.CREDENTIALS_DB_HOST
	});

const SESSION_DB_URL = process.env.SESSION_DB_URL ||
	getConnectionString({
		"username": process.env.SESSION_DB_USERNAME,
		"password": process.env.SESSION_DB_PASSWORD,
		"databaseName": process.env.SESSION_DB_NAME,
		"host": process.env.SESSION_DB_HOST
	});

const Config = {
	"app": {
		"environment": ENVIRONMENT,
		"isDevelopment": IS_DEVELOPMENT,
		"address": {
			"host": process.env.APP_ADDRESS_HOST,
			"insecurePort": Number(process.env.APP_ADDRESS_INSECURE_PORT),
			"port": PORT,
			"externalPort": Number(process.env.APP_ADDRESS_EXTERNAL_PORT) ||
				PORT,
			"isSecure": process.env.APP_ADDRESS_IS_SECURE ||
				process.env.APP_SSL_KEY && process.env.APP_SSL_CERT
		},
		"ssl": {
			"key": process.env.APP_SSL_KEY,
			"cert": process.env.APP_SSL_CERT
		}
	},
	"paths": {
		"root": PROJECT_ROOT,
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
			"url": DB_URL
		}
	},
	"session": {
		"secret": process.env.SESSION_SECRET,
		"db": {
			"url": SESSION_DB_URL
		}
	},
	"logging": {
		"error": {
			"file": process.env.LOGGING_ERROR_FILE ?
				path.resolve(PROJECT_ROOT, process.env.LOGGING_ERROR_FILE) :
				null
		},
		"access": {
			"file": process.env.LOGGING_ACCESS_FILE ?
				path.resolve(PROJECT_ROOT, process.env.LOGGING_ACCESS_FILE) :
				null
		},
		"sql": {
			"file": process.env.LOGGING_SQL_FILE ?
				path.resolve(PROJECT_ROOT, process.env.LOGGING_SQL_FILE) :
				(
					IS_DEVELOPMENT ?
						null :
						false
				)
		}
	},
	"uploads": {
		"images": {
			"storage": {
				"directory": process.env.UPLOADS_IMAGES_STORAGE_DIRECTORY ||
					path.join(PROJECT_ROOT, "client-uploads", "images")
			}
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
		!(Config.app.address.externalPort === HTTP_DEFAULT_PORT && !Config.app.address.isSecure) &&
		!(Config.app.address.externalPort === HTTPS_DEFAULT_PORT && Config.app.address.isSecure)
	) {
		baseURL += ":" + Config.app.address.externalPort;
	}

	return baseURL;
};

exports = module.exports = Config;
