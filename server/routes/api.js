"use strict";

const express = require("express");

const router = express.Router();

router.use("/issues", require("./api/issues"));

router.use("/congress", require("./api/congress"));

router.use("/users", require("./api/users"));

exports = module.exports = router;
