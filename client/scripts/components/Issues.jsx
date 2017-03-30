import React      from "react";
import { Link }   from "react-router";
import IssuesList from "project/scripts/components/issues/List";
import IssueUtils from "project/scripts/utils/issue";
import UserUtils  from "project/scripts/utils/user";
import                 "project/styles/issues/issue-list.less";

class Issues extends React.Component {
	static propTypes = {
		"user": React.PropTypes.object.isRequired
	}

	state = {
		"issues": null,
		"issueLoadError": null
	}

	componentWillMount() {
		IssueUtils.findByUserID((this.props.user || UserUtils.currentUser).id).then(
			issues => this.setState({issues}),
			ex => this.setState({"issueLoadError": ex})
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
