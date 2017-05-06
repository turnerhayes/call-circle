"use strict";

const rfr             = require("rfr");
const UserModel       = rfr("server/persistence/models/user");
const IssueModel      = rfr("server/persistence/models/issue");
const UserIssuesModel = rfr("server/persistence/models/user-issues");
const TagModel        = rfr("server/persistence/models/tag");
const IssueImageModel = rfr("server/persistence/models/issue-image");

IssueModel.belongsTo(UserModel, { "as": "createdBy" });

UserModel.belongsToMany(IssueModel, {
	"through": UserIssuesModel,
	"foreignKey": "user_id"
});

UserIssuesModel.belongsTo(
	IssueModel,
	{
		"foreignKey": "issue_id"
	}
);

IssueModel.belongsToMany(UserModel, {
	"through": UserIssuesModel,
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

UserModel.hasMany(IssueImageModel, { "as": "issueImages" });

IssueImageModel.belongsTo(IssueModel, { "as": "issue" });

IssueImageModel.belongsTo(UserModel, { "as": "user" });

exports = module.exports = {
	"User": UserModel,
	"Issue": IssueModel,
	"UserIssues": UserIssuesModel,
	"Tag": TagModel,
	"IssueImage": IssueImageModel
};
