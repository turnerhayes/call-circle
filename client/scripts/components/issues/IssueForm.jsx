import {
	isString,
	map,
	uniqueId
}                           from "lodash";
import React                from "react";
import PropTypes            from "prop-types";
import { SingleDatePicker } from "react-dates";
import { withRouter }       from "react-router";
import { connect }          from "react-redux";
import moment               from "moment";
import {
	createIssue,
	editIssue
}                           from "project/scripts/redux/actions";
import TextEditor           from "project/scripts/components/TextEditor";
import IssueRecord          from "project/scripts/records/issue";
import Categories           from "project/shared-lib/categories";
import                           "react-dates/lib/css/_datepicker.css";

const PROP_NAMES = ["name", "category", "deadline", "description"];

const CATEGORY_LIST = map(Categories,
	(category, categoryType) => ({
		"id": categoryType,
		"name": category.name	
	})
);

function getState(issue) {
	if (issue) {
		return PROP_NAMES.reduce(
			(state, propName) => {
				state[propName] = issue.get(propName);

				return state;
			},
			{}
		);
	}
	else {
		return {
			"name": "",
			"category": CATEGORY_LIST[0].id,
			"deadline": null,
			"description": ""
		};
	}
}

class IssueForm extends React.Component {
	componentID = uniqueId(`${this.props.formType}-issue-`)

	static propTypes = {
		"issue": PropTypes.instanceOf(IssueRecord),
		"router": PropTypes.object.isRequired,
		"dispatch": PropTypes.func.isRequired,
		"formType": PropTypes.oneOf(["add", "edit"]).isRequired
	}

	state = Object.assign(getState(this.props.issue), {
		"isDeadlinePickerFocused": false
	})

	componentWillReceiveProps(nextProps) {
		this.setState(getState(nextProps.issue));
	}

	handleFormSubmit = event => {
		event.preventDefault();

		const dataValues = PROP_NAMES.reduce(
			(values, propName) => {
				values[propName] = this.state[propName];

				return values;
			},
			{}
		);

		if (!isString(dataValues.description)) {
			dataValues.description = TextEditor.toMarkdown(this.state.description);
		}

		if (dataValues.deadline) {
			// Convert Moment.js object to plain JS date
			dataValues.deadline = moment(dataValues.deadline).toDate();
		}

		dataValues.id = this.props.issue && this.props.issue.id;

		const saveFunc = this.props.formType === "add" ? createIssue : editIssue;

		this.props.dispatch(saveFunc(dataValues, {"redirectOnSuccess": true}));
	}

	render() {
		return (
			<form
				action={`/issues${this.props.issue ? "/" + this.props.issue.id : ""}`}
				method="post"
				encType="application/x-www-form-urlencoded"
				onSubmit={event => this.handleFormSubmit(event)}
			>
				<div
					className="form-group"
				>
					<label
						htmlFor={`${this.componentID}-name`}
						className="sr-only"
					>Name</label>
					<input
						type="text"
						className="form-control"
						id={`${this.componentID}-name`}
						placeholder="Name"
						defaultValue={this.state.name}
						onChange={event => this.setState({"name": event.target.value})}
						maxLength={1000}
						required
					/>
				</div>
				<div
					className="form-group"
				>
					<label
						htmlFor={`${this.componentID}-category`}
						className="sr-only"
					>Category</label>
					<select
						className="form-control"
						id={`${this.componentID}-category`}
						defaultValue={this.state.category}
						onChange={event => this.setState({"category": event.target.value})}
						required
					>
						{
							CATEGORY_LIST.map(
								category =>	(
									<option
										value={category.id}
										key={category.id}
									>{category.name}</option>
								)
							)
						}
					</select>
				</div>
				<div
					className="form-group"
				>
					<SingleDatePicker
						className="form-control"
						id={`${this.componentID}-deadline`}
						onDateChange={deadline => this.setState({deadline})}
						date={this.state.deadline && moment(this.state.deadline)}
						focused={this.state.isDeadlinePickerFocused}
						onFocusChange={status => this.setState({"isDeadlinePickerFocused": status.focused})}
						numberOfMonths={1}
						enableOutsideDays={true}
						isOutsideRange={() => false}
						placeholder="Deadline"
						showClearDate={true}
					/>
				</div>
				<div
					className="form-group"
				>
					<label
						htmlFor={`${this.componentID}-description`}
						className="sr-only"
					>Description</label>
					<div
						className="description-editor"
					>
						<TextEditor
							value={this.state.description}
							onChange={description => this.setState({description})}
							placeholder="Description"
						/>
					</div>
				</div>
				<button
					type="submit"
					className="btn btn-primary"
				>{this.props.issue ? "Save" : "Add"}</button>
			</form>
		);
	}
}

export default connect()(withRouter(IssueForm));
