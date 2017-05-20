import {
	isEmpty
}                         from "lodash";
import React              from "react";
import PropTypes          from "prop-types";
import { connect }        from "react-redux";
import UserRecord         from "project/scripts/records/user";
import {
	getUser,
	updateUserProfile
}                         from "project/scripts/redux/actions";
import DistrictInput      from "project/scripts/components/congress/DistrictInput";

class UserProfile extends React.Component {
	static propTypes = {
		"userID": PropTypes.string,
		"user": PropTypes.instanceOf(UserRecord),
		"currentUser": PropTypes.instanceOf(UserRecord),
		"dispatch": PropTypes.func.isRequired
	}

	state = {
		"userLoadError": null,
		"userLocation": null
	}

	componentWillMount() {
		if (!this.props.user && this.props.userID !== this.props.currentUser.id) {
			this.props.dispatch(
				getUser({
					"userID": this.props.userID 
				})
			);
		}

		if (this.props.user) {
			this._setLocationFromUser(this.props.user);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.user) {
			this._setLocationFromUser(nextProps.user);
		}
	}

	_setLocationFromUser = user => {
		this.setState({
			"userLocation": user.location.toJS()
		});
	}

	saveProfile = () => {
		const updateData = {
			"userID": this.props.user.id
		};

		if (this.state.userLocation) {
			updateData.location = this.state.userLocation;
		}

		this.props.dispatch(updateUserProfile(updateData));
	}

	isDirty = () => {
		return !isEmpty(this.state.userLocation) &&
		(
			isEmpty(this.props.user.location) ||
			(
				this.props.user.location.get("state") !== this.state.userLocation.state ||
				this.props.user.location.get("district") !== this.state.userLocation.district
			)
		);
	}

	renderLocationForm = () => {
		return (
			<form
				method="put"
				action={`/api/user/${this.props.user.id}/location`}
			>
				<DistrictInput
					state={this.state.userLocation && this.state.userLocation.state}
					district={this.state.userLocation && this.state.userLocation.district}
					onStateChange={
						state => {
							let userLocation = this.state.userLocation;

							if (!state) {
								if (userLocation) {
									delete userLocation.state;
								}
							}
							else {
								userLocation = Object.assign(this.state.userLocation || {}, { state });
							}

							delete userLocation.district;
							
							this.setState({ userLocation });
						}
					}
					onDistrictChange={
						district => {
							let userLocation = this.state.userLocation;

							if (!district) {
								if (userLocation) {
									delete userLocation.district;
								}
							}
							else {
								userLocation = Object.assign(this.state.userLocation || {}, { district });
							}

							this.setState({ userLocation });
						}
					}
				/>
			</form>
		);
	}

	renderLocationDisplay = () => {
		return this.state.userLocation ?
			(
				<div
				>
					{this.state.userLocation.state}, District {this.state.userLocation.district}
				</div>
			) :
			""
		;
	}

	renderLoadError = () => {
		return (
			<div>
				Error loading user.
			</div>
		);
	}

	renderUserLoading = () => {
		return (
			<div>
				<span className="fa fa-spinner fa-spin" /> Loading user profile&hellip;
			</div>
		);
	}

	renderUserProfile = () => {
		return (
			<div>
				<header>
					<h1>
						{this.props.user.displayName}
					</h1>
				</header>
				<section>
					<header>
						<h2>Location</h2>
					</header>
					{
						this.props.user.id === this.props.currentUser.id ?
							this.renderLocationForm() :
							this.renderLocationDisplay()
					}
					
					<button
						type="button"
						className="btn btn-primary"
						onClick={this.saveProfile}
						disabled={!this.isDirty()}
					>
						Save Changes
					</button>
				</section>
			</div>
		);
	}

	render() {
		if (this.state.userLoadError !== null) {
			this.renderLoadError();
			return;
		}

		if (!this.props.user) {
			this.renderUserLoading();
			return;
		}

		return this.renderUserProfile();
	}
}

export default connect(
	(state, ownProps) => {
		const { userID } = ownProps;
		const users = state.get("users");
		const currentUser = users.currentUser;
		let user;

		if (!userID || userID === currentUser.id) {
			user = currentUser;
		}
		else {
			user = users.get(userID);
		}

		return {
			currentUser,
			user
		};
	}
)(UserProfile);
