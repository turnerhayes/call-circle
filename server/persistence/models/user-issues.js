"use strict";

const rfr       = require("rfr");
const DB        = rfr("server/persistence/database-connection");

module.exports = exports = DB.define("user_issues",
	{},
	{
		"paranoid": false
	}
);
