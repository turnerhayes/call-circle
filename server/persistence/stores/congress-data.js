"use strict";

const _       = require("lodash");
const path    = require("path");
const Promise = require("bluebird");
const fs      = Promise.promisifyAll(require("fs"));
const request = require("request-promise");
const rfr     = require("rfr");
const Config  = rfr("server/lib/config");
const civicInformationAPIKey = rfr("client/scripts/api-keys.json").google.civicInformation.key;

const API_VERSION = 1;

const LATEST_CONGRESS_NUMBER = 115;

const CACHE_DIRECTORY = path.resolve(__dirname, "cache");

const REQUEST_OPTIONS = {
	"transform": JSON.parse.bind(JSON),
	"headers": {
		"X-API-Key": Config.thirdParty.proPublica.apiKey
	}
};

function getDistrict({address}) {
	const queryString = {
		"key": civicInformationAPIKey,
		"includeOffices": false,
		"levels": "country",
		address
	};

	return request({
		"uri": `https://www.googleapis.com/civicinfo/v2/representatives`,
		"qs": queryString,
		"type": "GET",
		"json": true
	}).then(
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
	);
}

function getAPIURL(chamber, congressNumber) {
	return "https://api.propublica.org/congress/v" + API_VERSION + "/" +
		congressNumber + "/" + chamber + "/members.json";
}

exports = module.exports = class CongressDataStore {
	static getHouseMembers({ congress = LATEST_CONGRESS_NUMBER } = {}) {
		const cacheFile = path.join(CACHE_DIRECTORY, "house-" + congress + "-members.json");

		return fs.readFileAsync(cacheFile).then(
			cacheContents => JSON.parse(cacheContents)
		).catch(
			() => request.get(
				getAPIURL("house", congress),
				REQUEST_OPTIONS
			).then(
				response =>  {
					const members = response.results[0].members;
					fs.writeFile(cacheFile, JSON.stringify(members));

					return members;
				}
			) 
		);
	}

	static getSenateMembers({ congress = LATEST_CONGRESS_NUMBER } = {}) {
		const cacheFile = path.join(CACHE_DIRECTORY, "senate-" + congress + "-members.json");

		return fs.readFileAsync(cacheFile).then(
			cacheContents => JSON.parse(cacheContents)
		).catch(
			() => request.get(
				getAPIURL("senate", congress),
				REQUEST_OPTIONS
			).then(
				response => {
					const members = response.results[0].members;
					fs.writeFile(cacheFile, JSON.stringify(members));

					return members;
				}
			)
		);
	}

	static getDistricts(options) {
		return CongressDataStore.getHouseMembers(options).then(
			members => members.reduce(
				(districts, member) => {
					if (!districts[member.state]) {
						districts[member.state] = [];
					}

					districts[member.state].push(Number(member.district));

					return districts;
				},
				{}
			)
		);
	}

	static getMemberInfo({ chamber, state, district, congress = LATEST_CONGRESS_NUMBER }) {
		return (
			chamber === "house" ?
				CongressDataStore.getHouseMembers({ congress }) :
				CongressDataStore.getSenateMembers({ congress })
		).then(
			members => {
				if (chamber === "house") {
					return [_.find(
						members,
						{
							state,
							district
						}
					)];
				}

				return _.filter(members, { state });
			}
		);
	}

	static getDistrictFromAddress({ address }) {
		return getDistrict({address});
	}
};
