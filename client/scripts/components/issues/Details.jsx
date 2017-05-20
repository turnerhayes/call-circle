import { isEmpty }             from "lodash";
import { Set }                 from "immutable";
import React                   from "react";
import PropTypes               from "prop-types";
import ImmutablePropTypes      from "react-immutable-proptypes";
import { Link, withRouter }    from "react-router";
import { connect }             from "react-redux";
import { markdown }            from "markdown";
import ImageUpload             from "project/scripts/components/issues/ImageUpload";
import IssueSubscriptionToggle from "project/scripts/components/issues/SubscriptionToggle";
import ContactInfo             from "project/scripts/components/congress/ContactInfo";
import IssueRecord             from "project/scripts/records/issue";
import UserRecord              from "project/scripts/records/user";
import CongressMemberRecord    from "project/scripts/records/congress-member";
import IssueImageRecord        from "project/scripts/records/issue-image";
import CATEGORY_ICON_MAP       from "project/scripts/utils/category-icon-map";
import {
	fetchIssueByID,
	fetchIssueImages,
	uploadIssueImage,
	deleteIssueImage,
	getCongressionalRepresentatives,
}                              from "project/scripts/redux/actions";
import Categories              from "project/shared-lib/categories";
import                              "project/styles/issues/details.less";

const ISSUE_DETAILS_CONTAINER_CLASS = "c_issue-details";

class IssueDetails extends React.Component {
	static propTypes = {
		"issueID": PropTypes.number.isRequired,
		"issue": PropTypes.instanceOf(IssueRecord),
		"userIsSubscribed": PropTypes.bool,
		"userIssueImages": ImmutablePropTypes.listOf(
			PropTypes.instanceOf(IssueImageRecord)
		),
		"issueLoadError": PropTypes.object,
		"representatives": ImmutablePropTypes.listOf(
			PropTypes.instanceOf(CongressMemberRecord)
		),
		"representativesLoadError": PropTypes.object,
		"currentUser": PropTypes.instanceOf(UserRecord),
		"dispatch": PropTypes.func.isRequired
	}

	state = {
		"canToggleSubscription": true,
	}

	componentWillMount() {
		this.fetchData();
	}

	componentWillReceiveProps() {
		this.fetchData();
	}

	fetchData = () => {
		if (this.props.issueLoadError) {
			return;
		}
		
		if (this.props.issue) {
			if (!this.props.representatives && !this.props.representativesLoadError) {
				this.getRepresentatives();
			}

			if (!this.props.userIssueImages) {
				this.props.dispatch(fetchIssueImages({ "issueID": this.props.issueID }));
			}
		}
		else {
			this.props.dispatch(fetchIssueByID({ "issueID": this.props.issueID }));
		}
	}

	handleDeleteImage = image => {
		this.props.dispatch(deleteIssueImage({ image }));
	}

	handleUploadImage = file => {
		this.props.dispatch(uploadIssueImage({ "issueID": this.props.issueID, file }));
	}

	getRepresentatives = () => {
		this.props.dispatch(getCongressionalRepresentatives({
			"state": this.props.currentUser.location.get("state"),
			"district": this.props.currentUser.location.get("district")
		}));
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
		if (isEmpty(this.props.currentUser.location)) {
			return (
				<div>
					You don&#39;t have your location set. Update your <Link
						to="/profile"
					>profile</Link> so that you can see contact information for your
					members of Congress.
				</div>
			);
		}

		if (this.props.representativesLoadError) {
			return (
				<div>
					Error loading information about your representatives.
				</div>
			);
		}

		if (this.props.representatives) {
			return (
				<ul
					className="c_issue-details--representatives-contact-info--list"
				>
				{
					this.props.representatives.map(
						rep => (
							<li
								key={rep.id}
							>
								<ContactInfo
									memberInfo={rep}
								/>
							</li>
						)
					).toJS()
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
		return (
			<div className={ISSUE_DETAILS_CONTAINER_CLASS}>
				<header className="issue-header">
					<h1 className="issue-title">
						<span
							className={`category fa fa-${CATEGORY_ICON_MAP[this.props.issue.category]}`}
							aria-label={`Category: ${Categories[this.props.issue.category].name}`}
							title={`Category: ${Categories[this.props.issue.category].name}`}
						/>
						{this.props.issue.name}
					</h1>

					<div className="issue-actions">
						<IssueSubscriptionToggle
							issue={this.props.issue}
						/>
						{
							this.props.issue.createdByID === this.props.currentUser.id ?
								(
									<Link
										className="edit-issue-link fa fa-edit fa-2x"
										to={`/issues/edit/${this.props.issue.id}`}
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
					dangerouslySetInnerHTML={{"__html": markdown.toHTML(this.props.issue.description)}}
				/>

				{
					this.props.userIsSubscribed && this.renderRepresentativesContactInfo()
				}
				{
					this.props.userIsSubscribed && (
							<ImageUpload
								issue={this.props.issue}
								userIssueImages={this.props.userIssueImages}
								onDeleteImage={this.handleDeleteImage}
								onUploadImage={this.handleUploadImage}
							/>
						)
				}
				{}

			</div>
		);
	}

	renderLoadError() {
		console.error("Error loading issue: ", this.props.issueLoadError);
		return (
			<div className={`${ISSUE_DETAILS_CONTAINER_CLASS} loading-error`}>
				<span className="error-icon fa fa-exclamation-circle" />
				<span className="error-message">Unable to load this issue.</span>
			</div>
		);
	}

	render() {
		if (this.props.issueLoadError) {
			return this.renderLoadError();
		}

		return this.props.issue ? this.renderIssue() : this.renderIssueLoading();
	}
}

export default connect(
	(state, ownProps) => {
		const issues = state.get("issues");
		const issueImages = state.get("issueImages");
		const congress = state.get("congress");
		const users = state.get("users");
		const subscriptions = users.get("subscriptions", Set());
		const { issueID } = ownProps;
		const currentUser = users.currentUser;

		const props = {
			issueID,
			currentUser,
			"userIsSubscribed": subscriptions.includes(issueID)
		};

		if (issues.get("issueLoadError")) {
			props.issueLoadError = issues.get("issueLoadError");
		}
		else {
			props.issue = issues && issues.get("items") &&
				issues.get("items").find(issue => issue.id === issueID);
		}

		if (
			issueImages && issueImages.has("items")
		) {
			props.userIssueImages = issueImages.get("items").filter(
				image => image.get("userID") === currentUser.id && image.get("issueID") === issueID
			).toList();
		}

		if (congress.get("representativesLoadError")) {
			props.representativesLoadError = congress.get("representativesLoadError");
		}
		else {
			if (
				!isEmpty(currentUser.location) &&
					congress && congress.has("items")
			) {
				props.representatives = congress.get("items").filter(
					member => member.state === currentUser.getIn(["location", "state"]) &&
						(
							member.chamber === "senate" ||
								Number(member.district) === currentUser.getIn(["location", "district"])
						)
				).toList();
			}
		}

		return props;
	}
)(withRouter(IssueDetails));
