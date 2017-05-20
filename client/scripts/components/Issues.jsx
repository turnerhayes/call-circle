import { Map, Set }      from "immutable";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router";
import { connect }        from "react-redux";
import IssuesList         from "project/scripts/components/issues/List";
import UserRecord         from "project/scripts/records/user";
import IssueRecord        from "project/scripts/records/issue";
import {
	fetchIssuesForUser,
	getSubscriptionsForUser
}                         from "project/scripts/redux/actions";
import                         "project/styles/issues/issue-list.less";

class Issues extends React.Component {
	static propTypes = {
		"user": PropTypes.instanceOf(UserRecord).isRequired,
		"dispatch": PropTypes.func.isRequired,
		"issues": ImmutablePropTypes.listOf(
			PropTypes.instanceOf(IssueRecord)
		),
		"issueLoadError": PropTypes.object
	}

	componentWillMount() {
		const { dispatch, user } = this.props;
		const userID = user.id;

		dispatch(getSubscriptionsForUser({ userID }));
		dispatch(fetchIssuesForUser({ userID }));
	}

	renderLoading() {
		return (
			<div>
				<span className="fa fa-spinner fa-spin fa-2x" />
				<span>Loading&hellip;</span>
			</div>
		);
	}

	renderLoadError() {
		return (
			<div>
				<span className="fa fa-exclamation-circle" />
				<span>Error loading issues</span>
			</div>
		);
	}

	renderIssues() {
		return (
			<section className="issues-container">
				<div className="issue-links">
					<Link
						className="fa fa-calendar-plus-o fa-2x"
						to="/issues/add"
						aria-label="Create an issue"
						title="Create an issue"
					>
					</Link>
					<Link
						className="fa fa-search fa-2x"
						to="/issues/search"
						aria-label="Search Issues"
						title="Search Issues"
					>
					</Link>
				</div>
				<IssuesList issues={this.props.issues} />
			</section>
		);
	}

	render() {
		if (this.props.issueLoadError) {
			return this.renderLoadError();
		}

		return this.props.issues ? this.renderIssues() : this.renderLoading();
	}
}

export default connect(
	(state, ownProps) => {
		const issues = state.get("issues");
		const users = state.get("users");
		const subscriptions = users.get("subscriptions", Set());

		let { user } = ownProps;

		if (!user) {
			user = users.currentUser;
		}

		if (issues.get("itemLoadError")) {
			return {
				"itemLoadError": issues.get("itemLoadError")
			};
		}

		return {
			user,
			"issues": issues.get("items", Map()).toList().filter(issue => subscriptions.includes(issue.id))
		};
	}
)(Issues);
