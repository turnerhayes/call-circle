"use strict";

const path    = require("path");
const Promise = require("bluebird");
const fs      = Promise.promisifyAll(require("fs"));
const request = require("request-promise");
const Config  = require("../../../lib/config");

const API_VERSION = 1;

const LATEST_CONGRESS_NUMBER = 115;

const CACHE_DIRECTORY = path.resolve(__dirname, "cache");

const REQUEST_OPTIONS = {
	"transform": JSON.parse.bind(JSON),
	"headers": {
		"X-API-Key": Config.thirdParty.proPublica.apiKey
	}
};

function getAPIURL(chamber, congressNumber) {
	return "https://api.propublica.org/congress/v" + API_VERSION + "/" +
		congressNumber + "/" + chamber + "/members.json";
}

exports = module.exports = class CongressDataStore {
	static getHouseMembers(options) {
		options = options || {};

		options.congress = options.congress || LATEST_CONGRESS_NUMBER;

		const cacheFile = path.join(CACHE_DIRECTORY, "house-" + options.congress + "-members.json");

		return fs.readFileAsync(cacheFile).then(
			cacheContents => JSON.parse(cacheContents)
		).catch(
			() => request.get(
				getAPIURL("house", options.congress),
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

	static getSenateMembers(options) {
		options = options || {};

		options.congress = options.congress || LATEST_CONGRESS_NUMBER;

		const cacheFile = path.join(CACHE_DIRECTORY, "senate-" + options.congress + "-members.json");

		return fs.readFileAsync(cacheFile).then(
			cacheContents => JSON.parse(cacheContents)
		).catch(
			() => request.get(
				getAPIURL("senate", options.congress),
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
		options = options || {};

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
};
