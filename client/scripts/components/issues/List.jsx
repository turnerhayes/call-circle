import React              from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router";

export default class IssuesList extends React.Component {
	static propTypes = {
		"issues": ImmutablePropTypes.listOf(
			ImmutablePropTypes.map
		)
	}

	render() {
		return (
			<div className="issue-list">
				<ul>
					{
						this.props.issues.map(
							issue => (
								<li key={issue.get("id")}>
									<Link
										to={`/issues/${issue.get("id")}`}
									>
										{issue.get("name")}
									</Link>
								</li>
							)
						)
					}
				</ul>
			</div>
		);
	}
}
