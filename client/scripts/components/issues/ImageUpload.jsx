import { isEmpty }        from "lodash";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import Dropzone           from "react-dropzone";
import Config             from "project/shared-lib/config";
import IssueImageRecord   from "project/scripts/records/issue-image";
import IssueRecord        from "project/scripts/records/issue";
import                         "project/styles/issues/image-upload.less";

export default class ImageUpload extends React.Component {
	static propTypes = {
		"issue": PropTypes.instanceOf(IssueRecord).isRequired,
		"userIssueImages": ImmutablePropTypes.listOf(
			PropTypes.instanceOf(IssueImageRecord)
		),
		"className": PropTypes.string,
		"onDeleteImage": PropTypes.func,
		"onUploadImage": PropTypes.func.isRequired,
	}

	state = {
		"image": null,
		"expandedImage": null
	}

	handleImageSelect = accepted => {
		if (accepted.length > 0) {
			this.setState({"image": accepted[0]});
		}
	}

	handleFormSubmit = event => {
		event.preventDefault();

		this.props.onUploadImage(this.state.image);
	}

	deleteImage = image => {
		if (confirm("Are you sure you want to delete this image?")) {
			this.props.onDeleteImage(image);
		}
	}

	closeImagePopup = () => {
		this.setState({ "expandedImage": null });
	}

	renderUploadedImages = () => {
		return (
			<ul
				className="user-images"
			>
				{
					this.props.userIssueImages.map(
						image => (
							<li
								key={`user-image-${image.id}`}
								className="user-image"
							>
								<img
									onClick={() => this.setState({ "expandedImage": image.location })}
									src={image.location}
								/>
								{
									this.props.onDeleteImage && (
										<div
											className="delete-image-button fa-stack"
											onClick={() => this.deleteImage(image)}
											role="button"
										>
											<span
												className="fa fa-circle fa-stack-2x"
											></span>
											<span
												className="fa fa-trash-o fa-inverse fa-stack-1x"
											></span>
										</div>
									)
								}
							</li>
						)
					)
				}
			</ul>
		);
	}

	render() {
		return (
			<div className={`image-upload ${this.props.className || ""}`}>
				{
					this.state.expandedImage ?
						(
							<div className="image-popup">
								<div
									className="image-popup--overlay"
									onClick={this.closeImagePopup}
								/>
								<div className="image-popup--content">
									<button
										className="image-popup--close-popup-button"
										onClick={this.closeImagePopup}
										aria-label="Close Popup"
										title="Close Popup"
									>
										<div className="fa-stack">
											<span
												className="fa fa-circle fa-stack-2x"
											></span>
											<span
												className="fa fa-remove fa-inverse fa-stack-1x"
											></span>
										</div>
									</button>
									<img src={this.state.expandedImage} />
								</div>
							</div>
						) : ""
				}
				<form
					className="image-upload--form"
					action={`/api/issue/${this.props.issue.id}/images`}
					method="post"
					encType="multipart/form-data"
					onSubmit={this.handleFormSubmit}
				>
					<Dropzone
						onDrop={this.handleImageSelect}
						accept={Config.issues.images.validMimeTypes.join(",")}
						className="image-upload--dropzone"
						multiple={false}
					>
					{
						({ isDragActive, isDragReject }) => {
							if (isDragActive) {
								return (
									<div
										className="dropzone-message accepted"
									>
									</div>
								);
							}

							if (isDragReject) {
								return (
									<div
										className="dropzone-message rejected"
									>
									</div>
								);
							}

							return this.state.image === null ?
								(
									<div
										className="dropzone-message"
									>
										Drop images here or click to choose an image
									</div>
								) :
								(
									<img
										className="image-upload--preview-image"
										src={this.state.image.preview}
									/>
								);
						}
					}
					</Dropzone>
					{
						!isEmpty(this.props.userIssueImages) &&
							this.renderUploadedImages()
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
