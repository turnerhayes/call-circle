import IssueImagesStateRecord from "project/scripts/records/state/issue-images";
import {
	FETCH_ISSUE_IMAGES,
	UPLOAD_ISSUE_IMAGE,
	DELETE_ISSUE_IMAGE
} from "project/scripts/redux/actions";

export default function issueImagesReducer(state = new IssueImagesStateRecord(), action) {
	switch (action.type) {
		case FETCH_ISSUE_IMAGES: {
			if (action.error) {
				return state.set("issueImageLoadError", action.payload);
			}

			return state.updateImages(action.payload).delete("issueImageLoadError");
		}

		case UPLOAD_ISSUE_IMAGE: {
			if (action.error) {
				return state.set("imageUploadError", action.payload);
			}

			return state.setIn(
				["items", action.payload.id],
				action.payload
			).delete("imageUploadError");
		}

		case DELETE_ISSUE_IMAGE: {
			if (action.error) {
				return state.set("imageDeleteError", action.payload);
			}

			return state.deleteIn(
				["items", action.payload.id]
			).delete("imageDeleteError");
		}

		default:
			return state;
	}
}
