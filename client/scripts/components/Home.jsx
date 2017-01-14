import React from "react";
import UserUtils from "../utils/user";
import UserInformation from "./home/UserInformation"
import "home.less";

class Home extends React.Component {
	render() {
		return (
			<div className="home-page">
				{
					UserUtils.currentUser ?
						(
							<UserInformation
								user={UserUtils.currentUser}
							/>
						) :
						<div className="login-container">
						</div>
				}
			</div>
		);
	}
}


export default Home;
