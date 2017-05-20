import { Record } from "immutable";

const schema = {
	"id": null,
	"name": "",
	"description": "",
	"deadline": null,
	"category": null,
	"createdByID": null
};

class IssueRecord extends Record(schema, "Issue") {

}

export default IssueRecord;
