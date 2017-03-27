import { isEmpty } from "lodash";
import React from "react";
import Dropzone from "react-dropzone";
import Config from "../../../../shared-lib/config";
import IssueImageUtils from "../../utils/issue-image";
import "issues/image-upload.less";

export default class ImageUpload extends React.Component {
	static propTypes = {
		"issue": React.PropTypes.object.isRequired,
		"className": React.PropTypes.string
	}

	state = {
		"image": null,
		"userImages": null,
		"expandedImage": null
	}

	setIssueImages = issue => {
		IssueImageUtils.getImages({
			issue
		}).then(
			userImages => this.setState({ userImages })
		);
	}

	componentWillMount = () => {
		this.setIssueImages(this.props.issue);
	}

	componentWillReceiveProps = nextProps => {
		if (nextProps.issue.id !== this.props.issue.id) {
			this.setIssueImages(nextProps.issue);
		}
	}

	handleImageSelect = (accepted) => {
		if (accepted.length > 0) {
			this.setState({"image": accepted[0]});
		}
	}

	handleFormSubmit = (event) => {
		event.preventDefault();

		IssueImageUtils.uploadImage({
			"issue": this.props.issue,
			"file": this.state.image
		});
	}

	deleteImage = image => {
		if (confirm("Are you sure you want to delete this image?")) {
			IssueImageUtils.deleteImage({
				image
			}).then(
				() => this.setState({
					"userImages": this.state.userImages.filter(
						img => img.id !== image.id
					)
				})
			);
		}
	}

	closeImagePopup = () => {
		this.setState({ "expandedImage": null });
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
						isEmpty(this.state.userImages) ?
							"" :
							(
								<ul
									className="user-images"
								>
									{
										this.state.userImages.map(
											image => (
												<li
													key={`user-image-${image.id}`}
													className="user-image"
												>
													<img
														onClick={() => this.setState({ "expandedImage": image.location })}
														src={image.location}
													/>
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
												</li>
											)
										)
									}
								</ul>
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
