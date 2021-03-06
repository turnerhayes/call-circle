import React     from "react";
import UserUtils from "project/scripts/utils/user";
import Login     from "project/scripts/components/Login";
import                "project/styles/home.less";

class Home extends React.Component {
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
					UserUtils.currentUser ?
						(
							<div>
								<div className="user-image-container">
									<img
										className="user-image"
										src={UserUtils.currentUser.profilePhotoURL}
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


export default Home;
