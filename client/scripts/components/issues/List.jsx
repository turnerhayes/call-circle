import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router";
import IssueRecord        from "project/scripts/records/issue";

export default class IssuesList extends React.Component {
	static propTypes = {
		"issues": ImmutablePropTypes.listOf(
			PropTypes.instanceOf(IssueRecord)
		)
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
