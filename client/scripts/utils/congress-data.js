import $          from "jquery";
import Promise    from "bluebird";
import { fromJS } from "immutable";
import APIKeys    from "project/scripts/api-keys.json";

// TODO: factor out of individual utils
function getErrorMessageFromXHR(jqXHR) {
	return jqXHR.responseJSON &&
	jqXHR.responseJSON.error &&
	jqXHR.responseJSON.error.message ?
		jqXHR.responseJSON.error.message :
		jqXHR.responseText;
}

export default class CongressDataUtils {
	static getDistricts() {
		return Promise.resolve(
			$.ajax({
				"url": "/api/congress/districts",
				"dataType": "json",
				"type": "get"
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(
				districts => fromJS(districts)
			)
		);
	}

	static getHouseMembers() {
		return Promise.resolve(
			$.ajax({
				"url": "/api/congress/house",
				"dataType": "json",
				"type": "get"
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(
				members => fromJS(members)
			)
		);
	}

	static getSenateMembers() {
		return Promise.resolve(
			$.ajax({
				"url": "/api/congress/senate",
				"dataType": "json",
				"type": "get"
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(
				members => fromJS(members)
			)
		);
	}

	static getMemberInfo({ chamber = null, state, district }) {
		let url = "/api/congress/";

		if (!chamber) {
			url += `members/${state}/${district}`;
		}
		else {
			url += state;

			if (chamber === "house") {
				url += `/${district}`;
			}
		}

		return Promise.resolve(
			$.ajax({
				"url": url,
				"type": "get"
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(
				members => fromJS(members)
			)
		);
	}

	static getDistrict({ address }) {
		return Promise.resolve(
			$.ajax({
				"url": "https://www.googleapis.com/civicinfo/v2/representatives",
				"dataType": "json",
				"data": {
					address,
					"key": APIKeys.google.civicInformation.key,
					"includeOffices": false,
					"levels": "country",
				},
				"type": "get"
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(
				results => {
					const state = results.normalizedInput.state;

					const keyRegEx = new RegExp("ocd-division/country:us/state:" + state.toLowerCase() + "/cd:(\\d+)");

					const divisionKeys = Object.keys(results.divisions);

					for (let i = divisionKeys.length - 1; i >= 0; i--) {
						const matches = keyRegEx.exec(divisionKeys[i]);

						if (matches) {
							return {
								"state": results.normalizedInput.state,
								"district": Number(matches[1])
							};
						}
					}

					const err = new Error(`Unable to find a district for address ${address}`);
					err.input = address;
					err.code = "NO_DISTRICT";

					throw err;
				}
			).then(
				district => fromJS(district)
			)
		);
	}
}
