import React from "react";
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from "draft-js";
import { draftjsToMd, mdToDraftjs } from "draftjs-md-converter";
import TextEditorToolbar from "./text-editor/Toolbar";
import "draft-js/dist/Draft.css";
import "text-editor.less";

class TextEditor extends React.Component {
	static toMarkdown(content) {
		if (!content) {
			return '';
		}

		return draftjsToMd(convertToRaw(content));
	}

	state = {
		editorState: EditorState.createWithContent(convertFromRaw(mdToDraftjs(this.props.value || '')))
	}

	// componentWillReceiveProps(nextProps) {
	// 	if (nextProps.)
	// }

	handleEditorStateChanged(newState) {
		this.setState({editorState: newState});

		if (this.props.onChange) {
			this.props.onChange(this.state.editorState.getCurrentContent());
		}
	}

	handleKeyCommand(command) {
		const newState = RichUtils.handleKeyCommand(this.state.editorState, command);

		if (newState) {
			this.handleEditorStateChanged(newState);
			return 'handled';
		}

		return 'not-handled';
	}

	handleStyleToggled(style, isEnabled) {
		this.handleEditorStateChanged(
			RichUtils.toggleInlineStyle(
				this.state.editorState,
				inlineStyle
			)
		);
	}

	render() {
		const draftProps = Object.assign({}, this.props);

		delete draftProps.className;
		delete draftProps.onChange;

		return (
			<div className={`text-editor ${this.props.className || ''}`}>
				{/*<TextEditorToolbar
									onStyleToggled={(style, isEnabled) => this.handleStyleToggled(style, isEnabled)}
								/>*/}
				<Editor
					editorState={this.state.editorState}
					onChange={state => this.handleEditorStateChanged(state)}
					handleKeyCommand={command => this.handleKeyCommand(command)}
					{...draftProps}
				/>
			</div>
		);
	}
}

export default TextEditor;
