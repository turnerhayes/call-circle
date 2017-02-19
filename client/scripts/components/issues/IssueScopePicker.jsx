import _ from "lodash";
import React from "react";
import CongressDataUtils from "../../utils/congress-data";
import "issues/issue-scope-picker";

function getOrdinalSuffix(num) {
	/* eslint-disable no-magic-numbers */
	let last = num % 100;

	// teens end with "th"; might as well include "20th" and "4th" through "9th"
	if (last < 21 && last > 3) {
		return "th";
	}

	last = num % 10;

	if (last === 1) {
		return "st";
	}

	if (last === 2) {
		return "nd";
	}

	if (last === 3) {
		return "rd";
	}
	/* eslint-enable no-magic-numbers */

	return "th";
}

export default class IssueScopePicker extends React.Component {
	state = {
		"districts": null,
		"districtsLoadError": null
	}

	static propTypes = {
		"onChange": React.PropTypes.func,
		"scope": React.PropTypes.array
	}

	static defaultProps = {
		"scope": []
	}

	componentDidMount() {
		CongressDataUtils.getDistricts().then(
			districts => this.setState({districts})
		).catch(ex => this.setState({"districtsLoadError": ex}));
	}

	handleScopeChange = (scope) => {
		if (this.props.onChange) {
			this.props.onChange(scope);
		}
	}

	renderPicker() {
		// eslint-disable-next-line no-magic-numbers
		const hasDistricts = this.props.scope[0] && this.state.districts[this.props.scope[0]].length > 1;

		return (
			<div className="issue-scope-picker">
				<span
					className={`state ${this.props.scope[0] ? "" : "placeholder"}`}
					onClick={() => {
						this.__stateCounter = this.__stateCounter || 0;
						this.__districtCounter = 0;

						this.handleScopeChange([
							_.keys(this.state.districts).sort()[this.__stateCounter++]
						]);

						this.__stateCounter = this.__stateCounter % _.keys(this.state).length;
					}}
				>
					{
						this.props.scope && this.props.scope[0] ?
							this.props.scope[0] :
							"State"
					}
				</span>
				{
					hasDistricts ?
						(
							<span className="divider">/</span>
						) :
						""
				}
				<span
					className={`district ${this.props.scope[1] ? "" : "placeholder"} ${hasDistricts ? "" : "hidden"}`}
					onClick={() => {
						this.__districtCounter = this.__districtCounter || 0;


						this.handleScopeChange([
							this.props.scope[0],
							this.state.districts[this.props.scope[0]].sort()[this.__districtCounter++]
						]);

						this.__districtCounter = this.__districtCounter % this.state.districts[this.props.scope[0]].length;
					}}
				>{
					this.props.scope && this.props.scope[0] && this.props.scope[1] ?
						`${this.props.scope[1]}${getOrdinalSuffix(this.props.scope[1])} District` :
						"District"
				}
				</span>
			</div>
		);
	}

	renderLoading() {
		return (
			<div className="loading">
				<div className="loading-indicator">
					<span className="spinner fa fa-spin fa-spinner">
					</span>
				</div>
			</div>
		);
	}

	renderLoadError() {
		return (
			<div className="loading-error">
				<span className="error-icon fa fa-exclamation-circle" />
				<span className="error-message">Unable to load this picker</span>
			</div>
		);
	}

	render() {
		if (this.state.districtsLoadError) {
			this.renderLoadError();
			return;
		}

		return this.state.districts ? this.renderPicker() : this.renderLoading();
	}
}
