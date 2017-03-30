import { uniqueId }         from "lodash";
import React                from "react";
import { Link, withRouter } from "react-router";
import Breadcrumbs          from "react-breadcrumbs";
import UserUtils            from "project/scripts/utils/user";
import                           "project/styles/breadcrumbs.less";

class TopNavigation extends React.Component {
	static propTypes = {
		"routes": React.PropTypes.array,
		"params": React.PropTypes.object
	}

	render() {
		let userLinkElements;

		if (UserUtils.currentUser) {
			userLinkElements = [
				<span key={uniqueId()}>Logged in as </span>,
				<Link href={`/profile/${UserUtils.currentUser.username}`} key={uniqueId()}>
					{UserUtils.currentUser.displayName}
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

export default withRouter(TopNavigation);
