import {
	map,
	size,
	sortBy,
	uniqueId,
	intersection
}                        from "lodash";
import React             from "react";
import SelectInput       from "react-select";
import GeoSuggest        from "react-geosuggest";
import Tether            from "react-tether";
import STATES            from "project/shared-lib/states.json";
import CongressDataUtils from "project/scripts/utils/congress-data";
import GoogleMaps        from "project/scripts/utils/google-maps";
import BrowserGeolocator from "project/scripts/utils/browser-geolocator";
import                        "react-select/dist/react-select.css";
import                        "project/styles/congress/district-input.less";
import                        "project/styles/geosuggest.css";

function getOrdinalSuffix(num) {
	/* eslint-disable no-magic-numbers */
	let last = num % 100;

	// teens end with "th"; might as well include "20th" and "4th" through "9th"
	if (last < 21 && last > 3) {
		return "th";
	}

	last = num % 10;

	if (last === 1) {
		return "st";
	}

	if (last === 2) {
		return "nd";
	}

	if (last === 3) {
		return "rd";
	}
	/* eslint-enable no-magic-numbers */

	return "th";
}

export default class DistrictInput extends React.Component {
	componentID = uniqueId("district-input-component")

	static propTypes = {
		"onStateChange": React.PropTypes.func.isRequired,
		"onDistrictChange": React.PropTypes.func.isRequired,
		"state": React.PropTypes.oneOf(Object.keys(STATES)),
		"district": React.PropTypes.number
	}

	state = {
		"districtOptions": null,
		"isLoadingDistricts": false,
		"isLoadingMaps": true,
		"googleInstance": null,
		"addressLookupDialogIsOpen": false,
		"address": ""
	}

	get geocoder() {
		if (this.state.isLoadingMaps) {
			return null;
		}

		if (!this._geocoder) {
			this._geocoder = new this.state.googleInstance.maps.Geocoder();
		}

		return this._geocoder;
	}

	componentWillMount() {
		GoogleMaps.promise.then(
			google => this.setState({
				"isLoadingMaps": false,
				"googleInstance": google
			})
		).catch(
			err => console.error("Unable to load Google Maps API:", err)
		);

		if (this.props.state) {
			this.loadDistrictOptions(this.props.state);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.state && nextProps.state !== this.props.state) {
			this.loadDistrictOptions(nextProps.state);
		}
	}

	loadDistrictOptions = state => {
		if (!state) {
			return null;
		}

		this.setState({ "isLoadingDistricts": true });
		return CongressDataUtils.getDistricts().then(
			districts => {
				districts = districts[state];

				if (size(districts) === 1) {
					this._changeDistrict(districts[0]);
					return;
				}

				this.setState({
					"isLoadingDistricts": false,
					"districtOptions": districts && districts.sort((a, b) => a - b).map(
						district => ({
							"value": district,
							"label": `${district}${getOrdinalSuffix(Number(district))} District`
						})
					)
				});
			}
		);
	}

	_changeState = state => {
		this.props.onStateChange(state);
	}

	_changeDistrict = district => {
		this.props.onDistrictChange(district);
	}

	onStateChange = state => {
		if (!state) {
			this.setState({
				"districtOptions": null
			});
			this._changeState(null);
			this._changeDistrict(null);
			return;
		}

		this._changeState(state);
	}

	onDistrictChange = district => {
		if (district === null) {
			this._changeDistrict(null);
			return;
		}

		this._changeDistrict(district);
	}

	toggleAddressLookupDialog = isOpen => {
		if (isOpen === undefined) {
			isOpen = !this.state.addressLookupDialogIsOpen;
		}

		const newState = { "addressLookupDialogIsOpen": isOpen };

		if (isOpen && !this.state.addressLookupDialogIsOpen) {
			newState.address = "";
		}

		this.setState(newState);
	}

	lookupAddress = (address = this.state.address) => {
		return CongressDataUtils.getDistrict({
			"address": address
		}).then(
			result => {
				this._changeState(result.state);
				this._changeDistrict(result.district);
				this.toggleAddressLookupDialog(false);
			}
		);
	}

	showCurrentPositionOptions = results => {
		console.log(results);
	}

	setAddressFromCurrentPosition = () => {
		BrowserGeolocator.getCurrentPosition().then(
			location => this.geocoder.geocode(
				{
					"location": {"lat": location.coords.latitude, "lng": location.coords.longitude}
				},
				(results, status) => {
					if (status === "OK") {
						results = results.filter(
							result => intersection(
								result.types,
								["premise", "subpremise", "establishment", "street_address"]
							).length > 0
						);

						if (results.length === 0) {
							// TODO: handle none found
							return;
						}

						/// DEBUG
						results = [results[0]];

						if (results.length > 1) {
							this.showCurrentPositionOptions(results);
							return;
						}

						const address = results[0].formatted_address;

						this.setState({ address });
						this.lookupAddress(address);
					}
					else {
						throw new Error(`Reverse geocoding failed: ${status}`);
					}
				}
			)
		);
	}

	renderLookup = () => {
		return (
			<div
				className="c_district-input--address-lookup"
			>
				<Tether
					attachment="middle left"
				>
					<button
						type="button"
						className="c_district-input--address-lookup--trigger fa fa-search"
						disabled={this.state.isLoadingMaps}
						onClick={() => this.toggleAddressLookupDialog()}
					></button>
					<div
						className={`c_district-input--address-lookup--dialog ${this.state.addressLookupDialogIsOpen ? "is-open" : ""}`}
					>
						<button
							type="button"
							className="fa fa-home"
							aria-label="Use current location"
							title="Use current location"
							onClick={this.setAddressFromCurrentPosition}
						></button>
						<div
							className="c_district-input--address-lookup--dialog--address-input"
						>
						{
							!this.state.isLoadingMaps &&
							<GeoSuggest
								googleMaps={this.state.googleInstance.maps}
								id={`${this.componentID}--address`}
								inputClassName="form-control"
								initialValue={this.state.address}
								country="us"
								onChange={address => this.setState({ address })}
								onSuggestSelect={suggestion => this.setState({ "address": suggestion.label })}
							/>
						}
						</div>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => this.lookupAddress()}
							disabled={/^\s*$/.test(this.state.address || "")}
						>
							Lookup
						</button>
					</div>
				</Tether>
			</div>
		);
	}

	render() {
		return (
			<div className="c_district-input form-inline">
				<div className="form-group">
					<label
						htmlFor={`${this.componentID}--state`}
					>
						State: 
					</label>
					<SelectInput
						id={`${this.componentID}--state`}
						className="c_district-input--state-select"
						value={this.props.state}
						onChange={selectedOption => this.onStateChange(selectedOption && selectedOption.value)}
						options={
							sortBy(
								map(STATES,
									(name, abbrev) => ({
										"value": abbrev,
										"label": name
									})
								),
								"value"
							)
						}
					/> 
				</div>
				<div className={`form-group ${
					!this.props.state ||
					(this.state.districtOptions && size(this.state.districtOptions) < 2) ?
						"hidden" :
						""
				}`}>
					<label
						htmlFor={`${this.componentID}--district`}
					>
						District: 
					</label>
					<SelectInput
						id={`${this.componentID}--district`}
						className="c_district-input--district-select"
						value={this.props.district}
						onChange={selectedOption => this.onDistrictChange(selectedOption && selectedOption.value)}
						isLoading={this.state.isLoadingDistricts}
						options={this.state.districtOptions}
					/>
				</div>
				{this.renderLookup()}
			</div>
		);
	}
}
