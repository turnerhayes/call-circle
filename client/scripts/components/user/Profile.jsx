import {
	isEmpty
}                        from "lodash";
import React             from "react";
import UserUtils         from "project/scripts/utils/user";
import DistrictInput     from "project/scripts/components/congress/DistrictInput";


export default class UserProfile extends React.Component {
	static propTypes = {
		"userID": React.PropTypes.string
	}

	state = {
		"user": null,
		"userLoadError": null,
		"userLocation": null
	}

	set user(user) {
		this.setState({
			user,
			"userLocation": isEmpty(user.location) ?
				null :
				{
					"state": user.location.state,
					"district": user.location.district
				}
		});
	}

	componentWillMount() {
		if (this.props.userID) {
			UserUtils.getUser(this.props.userID).then(
				user => this.user = user
			).catch(userLoadError => this.setState({ userLoadError }));
		}
		else {
			this.user = UserUtils.currentUser;
		}
	}

	saveProfile = () => {
		const updateData = {
			"userID": this.state.user.id
		};

		if (this.state.userLocation) {
			updateData.location = this.state.userLocation;
		}

		UserUtils.updateProfile(updateData).then(
			user => this.setState({
				"user": user,
				// Make a copy of the object, so that this component doesn't alter the user object
				// directly
				"userLocation": {
					"state": user.location.state,
					"district": user.location.district
				}
			})
		);
	}

	isDirty = () => {
		return !isEmpty(this.state.userLocation) &&
		(
			isEmpty(this.state.user.location) ||
			(
				this.state.user.location.state !== this.state.userLocation.state ||
				this.state.user.location.district !== this.state.userLocation.district
			)
		);
	}

	renderLocationForm = () => {
		return (
			<form
				method="put"
				action={`/api/user/${this.state.user.id}/location`}
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
						{this.state.user.displayName}
					</h1>
				</header>
				<section>
					<header>
						<h2>Location</h2>
					</header>
					{
						this.state.user.id === UserUtils.currentUser.id ?
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

		if (this.state.user === null) {
			this.renderUserLoading();
			return;
		}

		return this.renderUserProfile();
	}
}
