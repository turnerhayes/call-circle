import React                from "react";
import { connect }          from "react-redux";
import PropTypes            from "prop-types";
import ImmutablePropTypes   from "react-immutable-proptypes";
import {
	toggleIssueSubscription
}                           from "project/scripts/redux/actions";

class IssueSubscriptionToggle extends React.Component {
	static propTypes = {
		"issue": ImmutablePropTypes.map.isRequired,
		"isSubscribing": PropTypes.bool,
		"dispatch": PropTypes.func.isRequired
	}

	handleSubscribeButtonClick = () => {
		this.props.dispatch(toggleIssueSubscription({ "issue": this.props.issue }));
	}

	render() {
		const subscribeButtonLabel = this.props.issue.get("userIsSubscribed") ?
			"Unsubscribe from this issue" :
			"Subscribe to this issue";

		const subscribeButtonIcon = this.props.issue.get("userIsSubscribed") ?
			"minus" :
			"plus";

		return (
			<button
				className={`btn fa fa-${subscribeButtonIcon} fa-2x`}
				disabled={this.props.isSubscribing}
				aria-label={subscribeButtonLabel}
				title={subscribeButtonLabel}
				onClick={this.handleSubscribeButtonClick}
			>
			</button>
		);
	}
}

export default connect(
	state => {
		const issues = state.get("issues");
		const props = {};

		props.isSubscribing = issues.get("isSubscribing");

		return props;
	}
)(IssueSubscriptionToggle);
