"use strict";

const UserModel = require('./models/user');
const IssueModel = require('./models/issue');
const TagModel = require('./models/tag');

IssueModel.belongsTo(UserModel, { as: 'created_by' });

UserModel.belongsToMany(IssueModel, {
	through: 'user_issues',
	foreignKey: 'user_id'
});

IssueModel.belongsToMany(UserModel, {
	through: 'user_issues',
	foreignKey: 'issue_id'
});

TagModel.belongsToMany(IssueModel, {
	through: 'issue_tags',
	foreignKey: 'tag_name'
});

IssueModel.belongsToMany(TagModel, {
	through: 'issue_tags',
	foreignKey: 'issue_id'
});


exports = module.exports = {
	User: UserModel,
	Issue: IssueModel,
	Tag: TagModel
};
