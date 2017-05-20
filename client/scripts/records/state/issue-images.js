import { Record, Map } from "immutable";

const schema = {
	"items": Map()
};

class IssueImagesStateRecord extends Record(schema, "IssueImagesState") {
	updateImages = (images) => this.mergeDeepIn(
		["items"],
		images.map(image => [image.id, image])
	)
}

export default IssueImagesStateRecord;
