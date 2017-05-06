import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router";
import { connect }        from "react-redux";
import IssuesList         from "project/scripts/components/issues/List";
import {
	fetchIssuesForUser
}                         from "project/scripts/redux/actions";
import                         "project/styles/issues/issue-list.less";

class Issues extends React.Component {
	static propTypes = {
		"user": PropTypes.object.isRequired,
		"dispatch": PropTypes.func.isRequired,
		"issues": ImmutablePropTypes.listOf(
			ImmutablePropTypes.map
		),
		"issueLoadError": PropTypes.object
	}

	componentDidMount() {
		const { dispatch, user } = this.props;

		dispatch(fetchIssuesForUser({ "userID": user.id }));
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
	state => {
		const issues = state.get("issues");

		if (issues.get("itemLoadError")) {
			return {
				"itemLoadError": issues.get("itemLoadError")
			};
		}

		return {
			"issues": issues.get("items")
		};
	}
)(Issues);
