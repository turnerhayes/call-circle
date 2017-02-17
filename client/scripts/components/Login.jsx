import React from "react";
import "login.less";

class Login extends React.Component {
	render() {
		return (
			<div className="login-container">
				<h3>Log In or Sign In</h3>
				<div>
					<ul className="login-method-list">
						<li>
							<a
								href="/auth/fb"
								type="button"
								className="fb-login-button fa fa-facebook-square fa-3x"
								aria-label="Login with Facebook"
								title="Login with Facebook"
							></a>
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

export default Login;
