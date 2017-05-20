import { uniqueId }         from "lodash";
import React                from "react";
import { connect }          from "react-redux";
import PropTypes            from "prop-types";
import { Link, withRouter } from "react-router";
import Breadcrumbs          from "react-breadcrumbs";
import UserRecord           from "project/scripts/records/user";
import                           "project/styles/breadcrumbs.less";

class TopNavigation extends React.Component {
	static propTypes = {
		"routes": PropTypes.array,
		"params": PropTypes.object,
		"currentUser": PropTypes.instanceOf(UserRecord)
	}

	render() {
		let userLinkElements;

		if (this.props.currentUser) {
			userLinkElements = [
				<span key={uniqueId()}>Logged in as </span>,
				<Link to="/profile" key={uniqueId()}>
					{this.props.currentUser.displayName}
				</Link>
			];
		}
		else {
			userLinkElements = [
				<Link to="/" key={uniqueId()}>Log in</Link>
			];
		}

		return (
			<nav className="top-nav navbar navbar-default">
				<div className="container-fluid">
					<div className="navbar-header">
						<Breadcrumbs
							routes={this.props.routes}
							params={this.props.params}
							separator=" / "
							setDocumentTitle={true}
						/>
					</div>
					<ul className="nav navbar-nav">
						<li>
							<Link to="/issues">
								Issues
							</Link>
						</li>
					</ul>
					<p className="navbar-text navbar-right">
						{userLinkElements}
					</p>
				</div>
			</nav>
		);
	}
}

export default connect(
	state => {
		const currentUser = state.get("users").currentUser;

		return {
			currentUser
		};
	}
)(withRouter(TopNavigation));
