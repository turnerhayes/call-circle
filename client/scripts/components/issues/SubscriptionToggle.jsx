import React                 from "react";
import { connect }           from "react-redux";
import PropTypes             from "prop-types";
import UserRecord            from "project/scripts/records/user";
import IssueRecord           from "project/scripts/records/issue";
import {
	getSubscriptionsForUser,
	unsubscribeFromIssue,
	subscribeToIssue
}                            from "project/scripts/redux/actions";

class IssueSubscriptionToggle extends React.Component {
	static propTypes = {
		"issue": PropTypes.instanceOf(IssueRecord).isRequired,
		"isChangingSubscription": PropTypes.bool,
		"isSubscribed": PropTypes.bool,
		"currentUser": PropTypes.instanceOf(UserRecord).isRequired,
		"dispatch": PropTypes.func.isRequired
	}

	componentWillMount() {
		this.props.dispatch(getSubscriptionsForUser({ "userID": this.props.currentUser.id }));
	}

	handleSubscribeButtonClick = () => {
		const func = this.props.isSubscribed ? unsubscribeFromIssue : subscribeToIssue;
		this.props.dispatch(func({ "issue": this.props.issue }));
	}

	render() {
		const subscribeButtonLabel = this.props.isSubscribed ?
			"Unsubscribe from this issue" :
			"Subscribe to this issue";

		const subscribeButtonIcon = this.props.isSubscribed ?
			"minus" :
			"plus";

		return (
			<button
				className={`btn fa fa-${subscribeButtonIcon} fa-2x`}
				disabled={this.props.isChangingSubscription}
				aria-label={subscribeButtonLabel}
				title={subscribeButtonLabel}
				onClick={this.handleSubscribeButtonClick}
			>
			</button>
		);
	}
}

export default connect(
	(state, ownProps) => {
		const { issue } = ownProps;
		const users = state.get("users");
		const currentUser = users.currentUser;
		const props = {
			currentUser,
			"isChangingSubscription": users.isChangingSubscription,
			"isSubscribed": users.subscriptions &&
				users.subscriptions.includes(issue.id)
		};


		return props;
	}
)(IssueSubscriptionToggle);
