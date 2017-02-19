import React from "react";
import IssueForm from "./IssueForm";
import IssueUtils from "../../utils/issue";

const CONTAINER_CLASS = "edit-issue-container";

class EditIssue extends React.Component {
	static propTypes = {
		"issueID": React.PropTypes.number.isRequired
	}

	state = {
		"issue": null,
		"issueLoadError": null
	}

	componentWillMount() {
		IssueUtils.findByID(this.props.issueID).then(
			issue => {
				this.setState({
					"issue": issue
				});
			},
			ex => this.setState({"issueLoadError": ex})
		);
	}

	renderForm() {
		return (
			<div className={CONTAINER_CLASS}>
				<h2>Edit an Issue</h2>
				<IssueForm
					issue={this.state.issue}
				/>
			</div>
		);
	}

	renderIssueLoading() {
		return (
			<div className={`${CONTAINER_CLASS} loading`}>
				<div className="loading-indicator">
					<span className="spinner fa">
					</span>
				</div>
			</div>
		);
	}

	renderLoadError() {
		return (
			<div className={`${CONTAINER_CLASS} loading-error`}>
				<span className="error-icon fa fa-exclamation-circle" />
				<span className="error-message">Unable to load this issue.</span>
			</div>
		);
	}

	render() {
		if (this.state.issueLoadError) {
			return this.renderLoadError();
		}

		return this.state.issue ? this.renderForm() : this.renderIssueLoading();
	}
}

export default EditIssue;
