"use strict";

const _                    = require("lodash");
const express              = require("express");
const Promise              = require("bluebird");
const rfr                  = require("rfr");
const { mustAuthenticate } = rfr("server/routes/utils");
const CongressDataStore    = rfr("server/persistence/stores/congress-data");

const router = express.Router();

router.route("/chambers")
	.get(
		mustAuthenticate(),
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
		mustAuthenticate(),
		(req, res, next) => {
			CongressDataStore.getHouseMembers().then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route("/house/:state/:district")
	.get(
		mustAuthenticate(),
		(req, res, next) => {
			CongressDataStore.getMemberInfo({
				"chamber": "house",
				"state": req.params.state,
				"district": req.params.district
			}).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route("/senate")
	.get(
		mustAuthenticate(),
		(req, res, next) => {
			CongressDataStore.getSenateMembers().then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route("/senate/:state")
	.get(
		mustAuthenticate(),
		(req, res, next) => {
			CongressDataStore.getMemberInfo({
				"chamber": "senate",
				"state": req.params.state
			}).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route("/members/:state/:district")
	.get(
		mustAuthenticate(),
		(req, res, next) => {
			const { state } = req.params;
			const district = Number(req.params.district);

			if (!state) {
				const err = new Error("Must specify a state for which to find representatives");
				err.status = 400;

				next(err);
				return;
			}

			if (!district || _.isNaN(district)) {
				const err = new Error("Must specify a district for which to find representatives");
				err.status = 400;

				next(err);
				return;
			}

			CongressDataStore.getMemberInfo({
				state,
				"district": district
			}).then(
				res.json.bind(res)
			).catch(ex => next(ex));	
		}
	);

router.route("/districts")
	.get(
		mustAuthenticate(),
		(req, res, next) => {
			CongressDataStore.getDistricts().then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

exports = module.exports = router;
