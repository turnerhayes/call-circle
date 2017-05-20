import { Record } from "immutable";

const schema = {
	"id": null,
	"issueID": null,
	"userID": null,
	"location": null
};

class IssueImageRecord extends Record(schema, "IssueImage") {
}

export default IssueImageRecord;
