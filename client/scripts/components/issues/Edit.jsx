import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect }        from "react-redux";
import {
	fetchIssueByID
}                         from "project/scripts/redux/actions";
import IssueForm          from "project/scripts/components/issues/IssueForm";

const CONTAINER_CLASS = "edit-issue-container";

class EditIssue extends React.Component {
	static propTypes = {
		"issueID": PropTypes.number.isRequired,
		"issue": ImmutablePropTypes.map,
		"issueLoadError": PropTypes.object,
		"dispatch": PropTypes.func.isRequired
	}

	componentWillMount() {
		if (!this.props.issue) {
			this.props.dispatch(fetchIssueByID({ "issueID": this.props.issueID }));
		}
	}

	renderForm() {
		return (
			<div className={CONTAINER_CLASS}>
				<h2>Edit an Issue</h2>
				<IssueForm
					issue={this.props.issue}
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
		if (this.props.issueLoadError) {
			return this.renderLoadError();
		}

		return this.props.issue ? this.renderForm() : this.renderIssueLoading();
	}
}

export default connect(
	(state, ownProps) => {
		const { issueID } = ownProps;
		const issues = state.get("issues");
		const props = {
			issueID
		};

		if (issues.get("issueLoadError")) {
			props.issueLoadError = issues.get("issueLoadError");
		}
		else {
			props.issue = issues && issues.get("items") &&
				issues.get("items").find(issue => issue.get("id") === issueID);
		}

		return props;
	}
)(EditIssue);
