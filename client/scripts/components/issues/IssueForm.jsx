import _ from "lodash";
import React from "react";
import { SingleDatePicker } from "react-dates";
import TextEditor from "../TextEditor";
import IssueScopePicker from "./IssueScopePicker";
import Categories from "../../../../server/persistence/categories";
import "react-dates/lib/css/_datepicker.css";

export default class IssueForm extends React.Component {
	formType = this.props.isNew ? 'add' : 'edit'

	componentID = _.uniqueId(`${this.formType}-issue-`)

	static propTypes = {
		isNew: React.PropTypes.bool,
		name: React.PropTypes.string,
		category: React.PropTypes.string,
		deadline: React.PropTypes.object,
		scope: React.PropTypes.array,
		description: React.PropTypes.string,
		onNameChange: React.PropTypes.func,
		onCategoryChange: React.PropTypes.func,
		onDeadlineChange: React.PropTypes.func,
		onDescriptionChange: React.PropTypes.func,
		onScopeChange: React.PropTypes.func,
		onFormSubmit: React.PropTypes.func
	}

	static defaultProps = {
		isNew: false
	}

	state = {
		isDeadlinePickerFocused: false
	}

	handleChangeName = value => {
		if (this.props.onNameChange) {
			this.props.onNameChange(value);
		}
	}

	handleChangeCategory = value => {
		if (this.props.onCategoryChange) {
			this.props.onCategoryChange(value);
		}
	}

	handleChangeDeadline = value => {
		if (this.props.onDeadlineChange) {
			this.props.onDeadlineChange(value);
		}
	}

	handleChangeDescription = value => {
		if (this.props.onDescriptionChange) {
			this.props.onDescriptionChange(value);
		}
	}

	handleChangeScope = value => {
		if (this.props.onScopeChange) {
			this.props.onScopeChange(value);
		}
	}

	handleFormSubmit = event => {
		if (this.props.onFormSubmit) {
			this.props.onFormSubmit(event);
		}
	}

	render() {
		return (
			<form
				action={`/issues${this.props.isNew ? '' : '/' + this.props.id}`}
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
						defaultValue={this.props.name}
						onChange={event => this.handleChangeName(event.target.value)}
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
						defaultValue={this.props.category}
						onChange={event => this.handleChangeCategory(event.target.value)}
						required
					>
						{
							_.map(Categories,
								(category, categoryType) => (
									<option
										value={categoryType}
										key={categoryType}
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
						onDateChange={date => this.handleChangeDeadline(date)}
						date={this.props.deadline}
						focused={this.state.isDeadlinePickerFocused}
						onFocusChange={(status) => this.setState({isDeadlinePickerFocused: status.focused})}
						placeholder="Deadline"
						showClearDate={true}
					/>
				</div>
				<div
					className="form-group"
				>
					<label
						htmlFor={`${this.componentID}-scope`}
						className="sr-only"
					>Location</label>
					<IssueScopePicker
						scope={this.props.scope}
						onChange={value => this.handleChangeScope(value)}
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
							value={this.props.description}
							onChange={value => this.handleChangeDescription(value)}
							placeholder="Description"
						/>
					</div>
				</div>
				<button
					type="submit"
					className="btn btn-primary"
				>{this.props.isNew ? 'Add' : 'Save'}</button>
			</form>
		);
	}
}
