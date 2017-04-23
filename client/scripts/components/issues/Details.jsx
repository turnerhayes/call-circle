import React                from "react";
import { Link, withRouter } from "react-router";
import { markdown }         from "markdown";
import ImageUpload          from "project/scripts/components/issues/ImageUpload";
import ContactInfo          from "project/scripts/components/congress/ContactInfo";
import IssueUtils           from "project/scripts/utils/issue";
import UserUtils            from "project/scripts/utils/user";
import CongressDataUtils    from "project/scripts/utils/congress-data";
import Categories           from "project/shared-lib/categories";
import                           "project/styles/issues/details.less";

const ISSUE_DETAILS_CONTAINER_CLASS = "c_issue-details";

class IssueDetails extends React.Component {
	static propTypes = {
		"issueID": React.PropTypes.number.isRequired
	}

	state = {
		"issue": null,
		"issueLoadError": null,
		"canToggleSubscription": true,
		"representatives": null,
		"representativesLoadError": null
	}

	componentWillMount() {
		IssueUtils.findByID(this.props.issueID, {
			"includeUsers": true
		}).then(
			issue => this.setState({issue}),
			ex => this.setState({"issueLoadError": ex})
		);

		this.getRepresentatives();
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

	getRepresentatives = () => {
		CongressDataUtils.getMemberInfo({
			"state": UserUtils.currentUser.location.state,
			"district": UserUtils.currentUser.location.district
		}).then(
			representatives => this.setState({ representatives })
		).catch(
			representativesLoadError => this.setState({ representativesLoadError })
		);
	}

	renderIssueLoading = () => {
		return (
			<div className={`${ISSUE_DETAILS_CONTAINER_CLASS} loading`}>
				<div className="loading-indicator">
					<span className="spinner fa fa-spin fa-spinner">
					</span>
				</div>
			</div>
		);
	}

	renderRepresentativesContactInfo = () => {
		if (!UserUtils.currentUser.location) {
			return (
				<div>
					You don&#39;t have your location set. Update your <Link
						to={`/profile`}
					>profile</Link> so that you can see contact information for your
					members of Congress.
				</div>
			);
		}

		if (this.state.representativesLoadError) {
			return (
				<div>
					Error loading information about your representatives.
				</div>
			);
		}

		if (this.state.representatives) {
			return (
				<ul
					className="c_issue-details--representatives-contact-info--list"
				>
				{
					this.state.representatives.map(
						rep => (
							<li
								key={rep.id}
							>
								<ContactInfo
									memberInfo={rep}
								/>
							</li>
						)
					)
				}
				</ul>
			);
		}
			
		return (
			<div>
				Loading contact information for your representatives.
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
			<div className={ISSUE_DETAILS_CONTAINER_CLASS}>
				<header className="issue-header">
					<h1 className="issue-title">
						<span
							className={`category fa fa-${IssueUtils.CATEGORY_ICON_MAP[this.state.issue.category]}`}
							aria-label={`Category: ${Categories[this.state.issue.category].name}`}
							title={`Category: ${Categories[this.state.issue.category].name}`}
						/>
						{this.state.issue.name}
					</h1>

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

				{this.renderRepresentativesContactInfo()}

				<ImageUpload
					className={this.state.issue.userIsSubscribed ? "" : "hidden"}
					issue={this.state.issue}
				/>
			</div>
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
