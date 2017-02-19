import React from "react";
import { Link } from "react-router";

export default class IssuesList extends React.Component {
	static propTypes = {
		"issues": React.PropTypes.arrayOf(React.PropTypes.object)
	}

	render() {
		return (
			<div className="issue-list">
				<ul>
					{
						this.props.issues.map(
							issue => (
								<li key={issue.id}>
									<Link
										to={`/issues/${issue.id}`}
									>
										{issue.name}
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
