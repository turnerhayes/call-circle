import $ from "jquery";
import Promise from "bluebird";
import assert from "assert";

export default class IssueImageUtils {
	static getImages({ issue, user = null }) {
		assert(issue, "'issue' argument required for 'getImages()'");

		const query = user ? `?userid=${user.id}`: "";

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issue.id}/images${query}`,
				"type": "get"
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static uploadImage({ issue, file }) {
		assert(issue, "'issue' argument required for 'uploadImage()'");
		assert(file, "'file' argument required for 'uploadImage()'");

		const timestamp = new Date().toISOString();

		file.filename = `image-issue${issue.id}-${timestamp}`;

		const data = new FormData();

		data.append("file", file);

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${issue.id}/images`,
				"type": "post",
				"contentType": false,
				"processData": false,
				"data": data
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}

	static deleteImage({ image }) {
		assert(image, "'image' argument required for 'deleteImage()'");

		return Promise.resolve(
			$.ajax({
				"url": `/api/issues/${image.issueID}/images/${image.id}`,
				"type": "delete"
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}
}
