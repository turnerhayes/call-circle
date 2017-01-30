import React from "react";

const INLINE_STYLES = [
	{
		label: 'Bold',
		style: 'BOLD',
		icon: 'bold'
	},
	{
		label: 'Italic',
		style: 'ITALIC',
		icon: 'italic'
	},
	{
		label: 'Underline',
		style: 'UNDERLINE',
		icon: 'underline'
	},
	{
		label: 'Monospace',
		style: 'CODE',
		icon: 'code'
	}
];

export default class TextEditorToolbar extends React.Component {
	static propTypes = {
		onStyleToggled: React.PropTypes.func
	}

	state = {
		enabledInlineStyles: INLINE_STYLES.reduce(
			(memo, style) => {
				memo[style.style] = false;

				return memo;
			},
			{}
		)
	}

	handleButtonToggled(style, isEnabled) {
		const {enabledInlineStyles} = this.state;

		enabledInlineStyles[style.style] = isEnabled;

		if (this.props.onStyleToggled) {
			this.props.onStyleToggled(style.style, isEnabled);
		}

		this.setState({enabledInlineStyles});
	}

	render() {
		return (
			<div className="btn-group" data-toggle="buttons">
				{
					INLINE_STYLES.map(
						style => (
							<label
								key={style.label}
								className={`btn btn-primary fa fa-${style.icon}`}
							>
								<input
									type="checkbox"
									name={`text-controls--${style.label.toLowerCase()}`}
									defaultChecked={this.state.enabledInlineStyles[style.style]}
									onChange={event => this.handleButtonToggled(style, event.target.checked)}
								/>
							</label>
						)
					)
				}
			</div>
		);
	}
}
