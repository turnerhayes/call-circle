import $                  from "jquery";
import Promise            from "bluebird";
import React              from "react";
import PropTypes          from "prop-types";
import CongressMemberRecord from "project/scripts/records/congress-member";
import                         "project/styles/congress/contact-info.less";

function getMemberName(memberInfo, short) {
	let nameParts = [memberInfo.chamber === "house" ? "Rep." : "Sen."];

	if (!short) {
		nameParts.push(memberInfo.first_name);
	}

	if (memberInfo.middle_name && !short) {
		nameParts.push(memberInfo.middle_name);
	}

	nameParts.push(memberInfo.last_name);

	if (!short) {
		nameParts.push(`(${memberInfo.party})`);
	}

	return nameParts.join(" ");
}

export default class ContactInfo extends React.Component {
	static propTypes = {
		"memberInfo": PropTypes.instanceOf(CongressMemberRecord).isRequired
	}

	state = {
		"profilePhotoURL": null
	}

	componentWillMount() {
		this.getPhotoUrl();
	}

	getPhotoUrl = () => {
		if (this.props.memberInfo.facebook_account) {
			this.setState({
				"profilePhotoURL": `https://graph.facebook.com/${this.props.memberInfo.facebook_account}/picture?type=normal`
			});
			return;
		}

		if (this.props.memberInfo.twitter_account) {
			this.setState({
				"profilePhotoURL": `https://twitter.com/${this.props.memberInfo.twitter_account}/profile_picture?size=bigger`
			});
			return;
		}

		if (this.props.memberInfo.youtube_account) {
			Promise.resolve(
				$.ajax({
					"url": `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${this.props.memberInfo.youtube_account}&key=AIzaSyD2e8FEqjFkytWKVCzlbAviFN1Dh3o7UV8`,
					"type": "get",
					"contentType": "json"
				}).catch(
					jqXHR => {
						throw new Error(
							(
								jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error.message
							) ||
							jqXHR.responseText
						);
					}
				)
			).then(
				results => this.setState({ "profilePhotoURL": results.items[0].snippet.thumbnails.default.url })
			).catch(profilePhotoURLError => console.error(profilePhotoURLError));
		}
	}

	renderSocialMediaLinks = () => {
		const links = [];
		const memberName = getMemberName(this.props.memberInfo, true);

		if (this.props.memberInfo.facebook_account) {
			links.push((
				<li
					key={`${this.props.memberInfo.id}-facebook`}
				>
					<a
						className="btn fa fa-facebook"
						href={`https://facebook.com/${this.props.memberInfo.facebook_account}`}
						aria-label={`${memberName}'s Facbook page`}
						title={`${memberName}'s Facbook page`}
						target="_blank"
						rel="noopener"
					></a>
				</li>
			));
		}

		if (this.props.memberInfo.twitter_account) {
			links.push((
				<li
					key={`${this.props.memberInfo.id}-twitter`}
				>
					<a
						className="btn fa fa-twitter"
						href={`https://twitter.com/${this.props.memberInfo.twitter_account}`}
						aria-label={`${memberName}'s Twitter feed`}
						title={`${memberName}'s Twitter feed`}
						target="_blank"
						rel="noopener"
					></a>
				</li>
			));
		}

		if (this.props.memberInfo.youtube_account) {
			links.push((
				<li
					key={`${this.props.memberInfo.id}-youtube`}
				>
					<a
						className="btn fa fa-youtube-play"
						href={`https://youtube.com/${this.props.memberInfo.youtube_account}`}
						aria-label={`${memberName}'s Youtube channel`}
						title={`${memberName}'s Youtube channel`}
						target="_blank"
						rel="noopener"
					></a>
				</li>
			));
		}

		return (
			<ul
				className="c_contact-info--social-media--links"
			>
				{links}
			</ul>
		);
	}

	render() {
		const contactInfoItems = [];

		if (this.props.memberInfo.phone) {
			contactInfoItems.push(
				<dt
					key={`${this.props.memberInfo.id}-phone-label`}
				>Phone:</dt>,
				(
				<dd
					key={`${this.props.memberInfo.id}-phone-content`}
				>
					<a href={`tel:${this.props.memberInfo.phone}`}>{this.props.memberInfo.phone}</a>
				</dd>
				)
			);
		}

		if (this.props.memberInfo.fax) {
			contactInfoItems.push(
				<dt
					key={`${this.props.memberInfo.id}-fax-label`}
				>Fax:</dt>,
				(
				<dd
					key={`${this.props.memberInfo.id}-fax-content`}
				>
					<a href={`fax:${this.props.memberInfo.fax}`}>{this.props.memberInfo.fax}</a>
				</dd>
				)
			);
		}

		if (this.props.memberInfo.url) {
			contactInfoItems.push(
				<dt
					key={`${this.props.memberInfo.id}-website-label`}
				>Website:</dt>,
				(
				<dd
					key={`${this.props.memberInfo.id}-website-content`}
				>
					<a
						href={this.props.memberInfo.url}
						target="_blank"
					>{this.props.memberInfo.url}</a>
				</dd>
				)
			);
		}

		if (this.props.memberInfo.office) {
			contactInfoItems.push(
				<dt
					key={`${this.props.memberInfo.id}-office-label`}
				>D.C. Office:</dt>,
				(
				<dd
					key={`${this.props.memberInfo.id}-office-content`}
				>
					<p>
						{this.props.memberInfo.office}
						<br />
						{/*Washington, D.C. 20515*/}
					</p>
				</dd>
				)
			);
		}

		return (
			<div
				className="c_contact-info"
			>
				<div>
					<header
						className="clearfix"
					>
						{
							this.state.profilePhotoURL ?
								(
								<img
									src={this.state.profilePhotoURL}
									className="c_contact-info--profile-image"
									alt={`Picture of ${getMemberName(this.props.memberInfo, true)}`}
								/>
								) :
								""
						}
						<h2>
							{getMemberName(this.props.memberInfo)}
						</h2>
					</header>
					<dl
						className="dl-horizontal"
					>
						{contactInfoItems}
					</dl>
					{this.renderSocialMediaLinks()}
				</div>
			</div>
		);
	}
}
