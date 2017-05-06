// import {
// 	groupBy
// }              from "lodash";
import { Map } from "immutable";

import {
	FETCH_ISSUE_IMAGES,
	UPLOAD_ISSUE_IMAGE,
	DELETE_ISSUE_IMAGE
} from "project/scripts/redux/actions";

export default function issueImagesReducer(state = Map(), action) {
	switch (action.type) {
		case FETCH_ISSUE_IMAGES: {
			if (action.error) {
				return state.set("issueImageLoadError", action.payload);
			}

			return state.set(
				"items",
				Map(state.get("items") || {}).merge(action.payload.map(image => [image.get("id"), image]))
			).delete("issueImageLoadError");
		}

		case UPLOAD_ISSUE_IMAGE: {
			if (action.error) {
				return state.set("imageUploadError", action.payload);
			}

			return state.set(
				"items",
				(state.get("items") || Map()).set(action.payload.get("id"), action.payload)
			).delete("imageUploadError");
		}

		case DELETE_ISSUE_IMAGE: {
			if (action.error) {
				return state.set("imageDeleteError", action.payload);
			}

			return state.set(
				"items",
				state.get("items").delete(action.payload.get("id"))
			).delete("imageDeleteError");
		}

		default:
			return state;
	}
}
