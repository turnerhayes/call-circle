import _ from "lodash";
import React from "react";
import { withRouter } from "react-router";
import TextEditor from "../TextEditor";
import IssueForm from "./IssueForm";
import IssueUtils from "../../utils/issue";
import "issues/add.less";

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
