import _ from "lodash";
import React from "react";
import { SingleDatePicker } from "react-dates";
import { withRouter } from "react-router";
import $ from "jquery";
import TextEditor from "../TextEditor";
import IssueForm from "./IssueForm";
import IssueUtils from "../../utils/issue";
// import "issues/add.less";

const CONTAINER_CLASS = "edit-issue-container";

class EditIssue extends React.Component {
	componentID = _.uniqueId('edit-issue-')

	state = {
		name: "",
		category: undefined,
		deadline: undefined,
		description: "",
		scope: undefined,
		issueLoadError: null,
		isDeadlinePickerFocused: false
	}

	componentWillMount() {
		IssueUtils.findByID(this.props.issueID).then(
			issue => {
				const {id, name, category, deadline, description, scope} = issue;

				this.issueID = id;

				this.setState({
					name,
					category,
					deadline,
					description,
					scope,
					issueIsLoaded: true
				});
			},
			ex => this.setState({issueLoadError: ex})
		);
	}

	handleFormSubmit(event) {
		event.preventDefault();

		IssueUtils.editIssue({
			id: this.issueID,
			name: this.state.name,
			category: this.state.category,
			deadline: this.state.deadline ? this.state.deadline.toISOString() : null,
			description: this.state.description,
			scope: this.state.scope
		}).done(
			issue => this.props.router.push(`/issues/${issue.id}`)
		).fail(
			err => console.error('Error editing issue: ', err)
		);
	}

	renderForm() {
		return (
			<div className={CONTAINER_CLASS}>
				<h2>Edit an Issue</h2>
				<IssueForm
					isNew={false}
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

	renderIssueLoading() {
		return (
			<div className={`${CONTAINER_CLASS} loading`}>
				<div className="loading-indicator">
					<span className="spinner fa">
					</span>
				</div>
			</div>
		);
	}

	renderLoadError() {
		return (
			<div className={`${CONTAINER_CLASS} loading-error`}>
				<span className="error-icon fa fa-exclamation-circle" />
				<span className="error-message">Unable to load this issue.</span>
			</div>
		);
	}

	render() {
		if (this.state.issueLoadError) {
			return this.renderLoadError();
		}

		return this.state.issueIsLoaded ? this.renderForm() : this.renderIssueLoading();
	}
}

export default withRouter(EditIssue);
