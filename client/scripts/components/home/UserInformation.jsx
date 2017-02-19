import React from "react";
import { Link, withRouter } from "react-router";

class UserInformation extends React.Component {
	static propTypes = {
		"user": React.PropTypes.object.isRequired
	}

	confirmLogout() {
		if (window.confirm("Are you sure you want to log out?")) {
			document.location.href = "/logout";
		}
	}

	handleClickUserImage() {
		this.confirmLogout();
	}

	render() {
		return (
			<div className="user-info-container">
				<Link
					to="/groups"
					className="user-action-link groups position-west fa fa-users fa-3x"
					aria-label="Groups"
					title="Groups"
				></Link>
				<Link
					to="/issues"
					className="user-action-link issues position-east fa fa-calendar fa-3x"
					aria-label="Issues"
					title="Issues"
				></Link>
				<Link
					to="/settings"
					className="user-action-link settings position-south fa fa-gear fa-3x"
					aria-label="Issues"
					title="Issues"
				></Link>
				{
					this.props.user.profilePhotoURL ?
					(
						<div className="user-image-container">
							<img
								className="user-image"
								src={this.props.user.profilePhotoURL}
								onClick={() => this.handleClickUserImage()}
							/>
						</div>
					) :
					(
						<div
							className="user-image empty fa fa-user-circle"
						/>
					)
				}
			</div>
		);
	}
}

export default withRouter(UserInformation);
