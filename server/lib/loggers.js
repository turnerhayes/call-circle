"use strict";

const winston = require("winston");
const morgan = require("morgan");
const Config = require("../../lib/config");

let sqlLogger;

if (Config.logging.sql.file !== false) {
	const logger = new winston.Logger({
		"level": "info"
	});

	if (Config.logging.sql.file === null) {
		logger.add(winston.transports.Console);
	}
	else {
		logger.add(
			winston.transports.File,
			{
				"filename": Config.logging.sql.file,
				"timestamp": true
			}
		);
	}

	sqlLogger = function(msg) {
		logger.info(msg);
	};
}

const errorLogger = new winston.Logger({
	"level": "error",
	"transports": [
		new winston.transports.Console({
			"timestamp": true
		})
	]
});

exports = module.exports = {
	"http": morgan("dev"),
	"sql": sqlLogger,
	"errors": errorLogger
};
