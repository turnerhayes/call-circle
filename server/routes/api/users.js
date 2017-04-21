"use strict";

const express                  = require("express");
const rfr                      = require("rfr");
const UsersStore               = rfr("server/persistence/stores/user");
const AccessForbiddenException = rfr("server/persistence/exceptions/access-forbidden");

const router = express.Router();

router.route("/:userID")
	.patch(
		(req, res, next) => {
			const userID = Number(req.params.userID);

			if (!req.user || req.user.id !== userID) {
				next(new AccessForbiddenException("You do not have permissions to edit this user's information"));
			}
			const updates = req.body;

			UsersStore.updateUser({
				userID,
				updates
			}).then(
				() => UsersStore.findByID(userID)
			).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

exports = module.exports = router;
