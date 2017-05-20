import { Record } from "immutable";

const schema = {
	"id": null,
	"first_name": "",
	"middle_name": null,
	"last_name": "",
	"chamber": "house",
	"state": null,
	"district": 0,
	"party": null,
	"facebook_account": null,
	"twitter_account": null,
	"youtube_account": null,
	"phone": null,
	"fax": null,
	"url": null
};

class CongressMemberRecord extends Record(schema, "CongressMember") {
}

export default CongressMemberRecord;
