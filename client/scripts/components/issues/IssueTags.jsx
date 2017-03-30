import React       from "react";
import TagsInput   from "react-tagsinput";
import Autosuggest from "react-autosuggest";
import                  "react-tagsinput/react-tagsinput.css";

export default class IssueTags extends React.Component {
	static propTypes = {
		"onTagsChange": React.PropTypes.func.required,
		"tags": React.PropTypes.array
	}

	static defaultProps = {
		"tags": []
	}

	handleChangeTags = tags => {
		this.props.onTagsChange(tags);
	}

	render() {
		const handleChangeTags = this.handleChangeTags.bind(this);

		function renderAutocompleteInput(props) {
			delete props.addTag;

			const suggestions = ["foo", "bar", "bax"];

			const onChange = props.onChange;

			props.onChange = (event, {method}) => {
				if (method === "enter") {
					event.preventDefault();
				}
				else {
					onChange(event);
				}
			};

			return (
				<Autosuggest
					ref={props.ref}
					suggestions={suggestions}
					inputProps={props}
					getSuggestionValue={suggestion => suggestion}
					renderSuggestion={suggestion => (<span>{suggestion}</span>)}
					onSuggestionsClearRequested={() => handleChangeTags([])}
					onSuggestionsFetchRequested={() => {}}
				/>
			);
		}

		return (
			<TagsInput
				value={this.props.tags}
				onChange={tags => this.handleChangeTags(tags)}
				renderInput={renderAutocompleteInput}
			/>
		);
	}
}

