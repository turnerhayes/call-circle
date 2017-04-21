import React             from "react";
import CongressDataUtils from "project/scripts/utils/congress-data";

function getMemberName(memberInfo, chamber) {
	let nameParts = [chamber === "house" ? "Rep." : "Sen."];

	nameParts.push(memberInfo.first_name);

	if (memberInfo.middle_name) {
		nameParts.push(" ", memberInfo.middle_name);
	}

	nameParts.push(" ", memberInfo.last_name, " (", memberInfo.state);

	if (chamber === "house") {
		nameParts.push("-", memberInfo.district);
	}

	nameParts.push(")");

	return nameParts.join("");
}

export default class ContactInfo extends React.Component {
	static propTypes = {
		"chamber": React.PropTypes.oneOf([
			"house",
			"senate"
		]).isRequired,
		// TODO: Fill with actual states
		"state": React.PropTypes.oneOf([
			"MA"
		]).isRequired,
		"district": React.PropTypes.number
	}

	state = {
		"memberInfo": null,
		"infoLoadError": null
	}

	componentWillMount() {
		CongressDataUtils.getMemberInfo({
			"chamber": this.props.chamber,
			"state": this.props.state,
			"district": this.props.district
		}).then(
			memberInfo => this.setState({memberInfo})
		).catch(
			infoLoadError => this.setState({infoLoadError})
		);
	}

	renderContent = () => {
		if (this.state.infoLoadError) {
			return (
				<div>
					Error loading contact info
				</div>
			);
		}

		if (this.state.memberInfo === null) {
			return (
				<div
				>
					<span className="fa fa-spin fa-spinner" />
					Loading contact info
				</div>
			);
		}

		return (
			<div>
				<header>
					<h2>
						{getMemberName(this.state.memberInfo[0], this.props.chamber)}
					</h2>
				</header>
				<dl>
					<dt>Phone:</dt>
					<dd>{this.state.memberInfo.phone}</dd>
				</dl>
			</div>
		);
	}

	render() {
		return (
			<div
				className="congress-contact-info"
			>
				{this.renderContent()}
			</div>
		);
	}
}
