"use strict";

const UserModel = require("./models/user");
const IssueModel = require("./models/issue");
const TagModel = require("./models/tag");
const IssueImageModel = require("./models/issue-image");

IssueModel.belongsTo(UserModel, { "as": "createdBy" });

UserModel.belongsToMany(IssueModel, {
	"through": "user_issues",
	"foreignKey": "user_id"
});

IssueModel.belongsToMany(UserModel, {
	"through": "user_issues",
	"foreignKey": "issue_id"
});

TagModel.belongsToMany(IssueModel, {
	"through": "issue_tags",
	"foreignKey": "tag_name"
});

IssueModel.belongsToMany(TagModel, {
	"through": "issue_tags",
	"foreignKey": "issue_id"
});

IssueModel.hasMany(IssueImageModel, { "as": "images" });

exports = module.exports = {
	"User": UserModel,
	"Issue": IssueModel,
	"Tag": TagModel,
	"IssueImage": IssueImageModel
};
