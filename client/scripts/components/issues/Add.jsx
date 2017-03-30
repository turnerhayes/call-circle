import React          from "react";
import { withRouter } from "react-router";
import IssueForm      from "project/scripts/components/issues/IssueForm";
import                     "project/styles/issues/add.less";

class AddIssue extends React.Component {
	render() {
		return (
			<div className="add-issue-container">
				<h2>Create an Issue</h2>
				<IssueForm
				/>
			</div>
		);
	}
}

export default withRouter(AddIssue);
