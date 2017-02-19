#!/usr/bin/env node

"use strict";

require("dotenv").config();
const repl = require("repl");

const replServer = repl.start({
	"prompt": "ccircle> "
});

replServer.context.Models = require("../server/persistence/models");
replServer.context.Stores = {
	"User": require("../server/persistence/stores/user"),
	"Issue": require("../server/persistence/stores/issue")
};
