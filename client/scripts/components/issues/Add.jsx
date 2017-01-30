import _ from "lodash";
import React from "react";
import { SingleDatePicker } from "react-dates";
import { withRouter } from "react-router";
import TextEditor from "../TextEditor";
import IssueForm from "./IssueForm";
import Categories from "../../../../server/persistence/categories";
import IssueUtils from "../../utils/issue";
import "react-dates/lib/css/_datepicker.css";
import "issues/add.less";

class AddIssue extends React.Component {
	componentID = _.uniqueId('add-issue-')

	state = {
		name: "",
		category: _.first(_.keys(Categories)),
		deadline: null,
		scope: [],
		description: "",
		isDeadlinePickerFocused: false
	}

	handleFormSubmit(event) {
		event.preventDefault();

		IssueUtils.createIssue({
			name: this.state.name,
			category: this.state.category,
			deadline: this.state.deadline ? this.state.deadline.toISOString() : null,
			scope: this.state.scope,
			description: this.state.description
		}).done(
			issue => this.props.router.push(`/issues/${issue.id}`)
		).fail(
			err => console.error('Error adding issue: ', err)
		);
	}

	render() {
		return (
			<div className="add-issue-container">
				<h2>Create an Issue</h2>
				<IssueForm
					name={this.state.name}
					onNameChange={name => this.setState({name})}
					category={this.state.category}
					onCategoryChange={category => this.setState({category})}
					deadline={this.state.deadline}
					onDeadlineChange={deadline => this.setState({deadline})}
					description={this.state.description}
					onDescriptionChange={description => this.setState({description})}
					scope={this.state.scope}
					onScopeChange={scope => this.setState({scope})}
					onFormSubmit={event => this.handleFormSubmit(event)}
				/>
			</div>
		);
	}
}

export default withRouter(AddIssue);
