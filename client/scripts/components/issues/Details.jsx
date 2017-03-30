import React                from "react";
import { Link, withRouter } from "react-router";
import { markdown }         from "markdown";
import ImageUpload          from "project/scripts/components/issues/ImageUpload";
import IssueUtils           from "project/scripts/utils/issue";
import UserUtils            from "project/scripts/utils/user";
import Categories           from "project/shared-lib/categories";
import                           "project/styles/issues/details.less";

const ISSUE_DETAILS_CONTAINER_CLASS = "issue-details-container";

class IssueDetails extends React.Component {
	static propTypes = {
		"issueID": React.PropTypes.number.isRequired
	}

	state = {
		"issue": null,
		"issueLoadError": null,
		"canToggleSubscription": true
	}

	componentWillMount() {
		IssueUtils.findByID(this.props.issueID, {
			"includeUsers": true
		}).then(
			issue => this.setState({issue}),
			ex => this.setState({"issueLoadError": ex})
		);
	}

	handleSubscribeButtonClick = () => {
		const isSubscribing = !this.state.issue.userIsSubscribed;
		this.setState({"canToggleSubscription": false});

		(
			isSubscribing ?
				IssueUtils.subscribeToIssue(this.state.issue) :
				IssueUtils.unsubscribeFromIssue(this.state.issue)
		).then(
			() => {
				const issue = this.state.issue;

				issue.userIsSubscribed = isSubscribing;

				this.setState({ issue });
			}
		).finally(
			() => this.setState({ "canToggleSubscription": true })
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
		const subscribeButtonLabel = this.state.issue.userIsSubscribed ?
			"Unsubscribe from this issue" :
			"Subscribe to this issue";

		const subscribeButtonIcon = this.state.issue.userIsSubscribed ?
			"minus" :
			"plus";

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
							className={`btn fa fa-${subscribeButtonIcon} fa-2x`}
							disabled={!this.state.canToggleSubscription}
							aria-label={subscribeButtonLabel}
							title={subscribeButtonLabel}
							onClick={this.handleSubscribeButtonClick}
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
					dangerouslySetInnerHTML={{"__html": markdown.toHTML(this.state.issue.description)}}
				/>

				<ImageUpload
					className={this.state.issue.userIsSubscribed ? "" : "hidden"}
					issue={this.state.issue}
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
