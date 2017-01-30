import React from "react";
import { Link } from "react-router";
import IssuesList from "./issues/List";
import IssueUtils from "../utils/issue";
import UserUtils from "../utils/user";

class Issues extends React.Component {
	state = {
		issues: null,
		issueLoadError: null
	}

	componentWillMount() {
		IssueUtils.findByUserID((this.props.user || UserUtils.currentUser).id).then(
			issues => this.setState({issues}),
			ex => this.setState({issueLoadError: ex})
		);
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
			<section>
				<Link
					className="btn fa fa-calendar-plus-o fa-2x"
					to="/issues/add"
				>
					Create an Issue
				</Link>
				<Link
					className="fa fa-search"
					to="/issues/search"
				>
				</Link>
				<IssuesList issues={this.state.issues} />
			</section>
		);
	}

	render() {
		if (this.state.issueLoadError) {
			return this.renderLoadError();
		}

		return this.state.issues ? this.renderIssues() : this.renderLoading();
	}
}

export default Issues;
