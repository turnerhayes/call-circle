import { Record, Map } from "immutable";

const schema = {
	"items": Map(),
	"issueLoadError": undefined,
	"search": Map()
};

class IssuesStateRecord extends Record(schema, "IssuesState") {
}

// For some reason, when this is included in the class statement above, calling updateIssues
// returns an instance *without* updateIssues() available. Possibly something wrong Webpack
// is doing? Seems to work when explicitly attaching it to the prototype.
IssuesStateRecord.prototype.updateIssues = function updateIssues(issues) {
	return this.mergeDeepIn(["items"], Map(issues.map(issue => [issue.id, issue])));
};

export default IssuesStateRecord;
