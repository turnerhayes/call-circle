import $          from "jquery";
import Promise    from "bluebird";
import assert     from "assert";
import { fromJS } from "immutable";

// TODO: factor out of individual utils
function getErrorMessageFromXHR(jqXHR) {
	return jqXHR.responseJSON &&
	jqXHR.responseJSON.error &&
	jqXHR.responseJSON.error.message ?
		jqXHR.responseJSON.error.message :
		jqXHR.responseText;
}

export default class IssueImageUtils {
	static getImages({ issueID, user = null }) {
		assert(issueID, "'issueID' argument required for 'getImages()'");

		const query = user ? `?userid=${user.id}`: "";

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issueID}/images${query}`,
				"type": "get"
			}).then(
				images => fromJS(images)
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static uploadImage({ issueID, file }) {
		assert(issueID, "'issueID' argument required for 'uploadImage()'");
		assert(file, "'file' argument required for 'uploadImage()'");

		const timestamp = new Date().toISOString();

		file.filename = `image-issue${issueID}-${timestamp}`;

		const data = new FormData();

		data.append("file", file);

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issueID}/images`,
				"type": "post",
				"contentType": false,
				"processData": false,
				"data": data
			}).then(image => fromJS(image)).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static deleteImage({ image }) {
		assert(image, "'image' argument required for 'deleteImage()'");

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${image.get("issueID")}/images/${image.get("id")}`,
				"type": "delete"
			}).then(
				() => image
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}
}
