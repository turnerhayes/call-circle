import React from "react";
import {browserHistory} from "react-router";
import "login.less";

class Login extends React.Component {
	render() {
		return (
			<div className="login-container">
				<h3>Login Options</h3>
				<a
					href="/auth/fb"
					type="button"
					className="fb-login-button fa fa-facebook-square fa-3x"
					aria-label="Login with Facebook"
					title="Login with Facebook"
				></a>
			</div>
		);
	}
}

export default Login;
