"use strict";

const express           = require("express");
const Promise           = require("bluebird");
const rfr               = require("rfr");
const CongressDataStore = rfr("server/persistence/stores/congress-data");

const router = express.Router();

router.route("/chambers")
	.get(
		(req, res, next) => {
			Promise.all([
				CongressDataStore.getHouseMembers(),
				CongressDataStore.getSenateMembers()
			]).spread(
				(house, senate) => {
					res.json({
						"house": house,
						"senate": senate
					});
				}
			).catch(ex => next(ex));
		}
	);

router.route("/house")
	.get(
		(req, res, next) => {
			CongressDataStore.getHouseMembers().then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route("/senate")
	.get(
		(req, res, next) => {
			CongressDataStore.getSenateMembers().then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route("/districts")
	.get(
		(req, res, next) => {
			CongressDataStore.getDistricts().then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

exports = module.exports = router;
