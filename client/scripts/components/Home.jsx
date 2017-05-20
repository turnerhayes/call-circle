import React       from "react";
import PropTypes   from "prop-types";
import { connect } from "react-redux";
import Login       from "project/scripts/components/Login";
import UserRecord  from "project/scripts/records/user";
import                  "project/styles/home.less";

class Home extends React.Component {
	static propTypes = {
		"currentUser": PropTypes.instanceOf(UserRecord)
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
			<div className="home-page">
				{
					this.props.currentUser ?
						(
							<div>
								<div className="user-image-container">
									<img
										className="user-image"
										src={this.props.currentUser.profilePhotoURL}
										onClick={() => this.handleClickUserImage()}
									/>
								</div>
							</div>
						) :
						<Login />
				}
			</div>
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
)(Home);
