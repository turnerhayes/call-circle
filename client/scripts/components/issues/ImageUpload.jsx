import React from "react";
import Dropzone from "react-dropzone";
import IssueUtils from "../../utils/issue";
import UserUtils from "../../utils/user";
import "issues/image-upload.less";

export default class ImageUpload extends React.Component {
	static propTypes = {
		"issue": React.PropTypes.object.isRequired,
		"className": React.PropTypes.string
	}

	state = {
		"image": null
	}

	handleImageSelect = (accepted) => {
		if (accepted.length > 0) {
			this.setState({"image": accepted[0]});
		}
	}

	handleFormSubmit = (event) => {
		event.preventDefault();

		IssueUtils.uploadImage({
			"issue": this.props.issue,
			"user": UserUtils.currentUser,
			"file": this.state.image
		});
	}

	render() {
		return (
			<div className={`image-upload ${this.props.className || ""}`}>
				<form
					className="image-upload--form"
					action={`/api/issue/${this.props.issue.id}/images`}
					method="post"
					encType="multipart/form-data"
					onSubmit={this.handleFormSubmit}
				>
					{
						this.state.image === null ?
							(
								<Dropzone
									onDrop={this.handleImageSelect}
									accept="image/*"
								>
									<div>Drop images here or click to choose an image</div>
								</Dropzone>
							) :
							(
								<img
									className="image-upload--preview-image"
									src={this.state.image.preview}
								/>
							)
					}

					<button
						type="submit"
						className="btn btn-primary"
						disabled={this.state.image === null}
					>Upload</button>
				</form>
			</div>
		);
	}
}
