"use strict";

const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

exports = module.exports = {
	"app": {
		"environment": ENVIRONMENT,
		"isDevelopment": IS_DEVELOPMENT,	
	},
	"issues": {
		"images": {
			"validMimeTypes": [
				"image/png",
				"image/jpeg",
				"image/jpg",
				"image/webp"
			]
		}
	}
};
