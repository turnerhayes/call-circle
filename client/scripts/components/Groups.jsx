import React from "react";

class Groups extends React.Component {
	static propTypes = {
		"groups": React.PropTypes.array.isRequired
	}

	static defaultProps = {
		"groups": []
	}

	render() {
		return (
			<section className="groups-container">
				<ul className="groups-list">
				{
					this.props.groups.map(
						group => (
							<li key={group.name}>{group.name}</li>
						)
					)
				}
				</ul>
			</section>
		);
	}
}

export default Groups;
