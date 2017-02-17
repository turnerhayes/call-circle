import React from "react";
import { Link, withRouter } from "react-router";
import { markdown } from "markdown";
import IssueUtils from "../../utils/issue";
import UserUtils from "../../utils/user";
import Categories from "../../../../server/persistence/categories";
import "issues/details.less";

const ISSUE_DETAILS_CONTAINER_CLASS = "issue-details-container";

class IssueDetails extends React.Component {
	state = {
		issue: null,
		issueLoadError: null
	}

	componentWillMount() {
		IssueUtils.findByID(this.props.issueID, {
			includeUsers: true
		}).then(
			issue => this.setState({issue}),
			ex => this.setState({issueLoadError: ex})
		);
	}

	renderIssueLoading() {
		return (
			<div className={`${ISSUE_DETAILS_CONTAINER_CLASS} loading`}>
				<div className="loading-indicator">
					<span className="spinner fa fa-spin fa-spinner">
					</span>
				</div>
			</div>
		);
	}

	renderIssue() {
		return (
			<section className={ISSUE_DETAILS_CONTAINER_CLASS}>
				<header className="issue-header">
					<h2 className="issue-title">
						<span
							className={`category fa fa-${IssueUtils.CATEGORY_ICON_MAP[this.state.issue.category]}`}
							aria-label={`Category: ${Categories[this.state.issue.category].name}`}
							title={`Category: ${Categories[this.state.issue.category].name}`}
						/>
						{this.state.issue.name}
					</h2>

					<div className="issue-actions">
						<button
							className="btn fa fa-plus fa-2x"
							aria-label="Subscribe to Issue"
							title="Subscribe to Issue"
							onClick={() => IssueUtils.subscribeToIssue(this.state.issue)}
						>
						</button>
						{
							this.state.issue.createdBy.id === UserUtils.currentUser.id ?
								(
									<Link
										className="edit-issue-link fa fa-edit fa-2x"
										to={`/issues/edit/${this.state.issue.id}`}
										aria-label="Edit Issue"
										title="Edit Issue"
									/>
								) :
								""
						}
					</div>
				</header>

				<p
					className="description"
					dangerouslySetInnerHTML={{__html: markdown.toHTML(this.state.issue.description)}}
				/>
			</section>
		);
	}

	renderLoadError() {
		return (
			<div className={`${ISSUE_DETAILS_CONTAINER_CLASS} loading-error`}>
				<span className="error-icon fa fa-exclamation-circle" />
				<span className="error-message">Unable to load this issue.</span>
			</div>
		);
	}

	render() {
		if (this.state.issueLoadError) {
			return this.renderLoadError();
		}

		return this.state.issue === null ? this.renderIssueLoading() : this.renderIssue();
	}
}

export default withRouter(IssueDetails);
