"use strict";

const _       = require("lodash");
const path    = require("path");
const Promise = require("bluebird");
const fs      = Promise.promisifyAll(require("fs"));
const request = require("request-promise");
const rfr     = require("rfr");
const Config  = rfr("server/lib/config");

const API_VERSION = 1;

const LATEST_CONGRESS_NUMBER = 115;

const CACHE_DIRECTORY = path.resolve(__dirname, "cache");

const REQUEST_OPTIONS = {
	"transform": JSON.parse.bind(JSON),
	"headers": {
		"X-API-Key": Config.thirdParty.proPublica.apiKey
	}
};

function ensureCacheDirectory() {
	return fs.mkdirAsync(CACHE_DIRECTORY).catch(
		err => {
			// ignore "this directory already exists" errors
			if (err.code === "EEXIST") {
				return;
			}

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
				response => {
					const members = response.results[0].members;

					members.forEach(
						member => member.chamber = "house"
					);

					return members;
				}
			).then(
				members =>  {
					ensureCacheDirectory().then(
						() => fs.writeFile(cacheFile, JSON.stringify(members), { "encoding": "utf8" })
					);

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

					members.forEach(
						member => member.chamber = "senate"
					);

					return members;
				}
			).then(
				members => {
					ensureCacheDirectory().then(
						() => fs.writeFile(cacheFile, JSON.stringify(members), { "encoding": "utf8" })
					);

					return members;
				}
			)
		);
	}

	static getDistricts(options) {
		return CongressDataStore.getHouseMembers(options).then(
			members => _.reduce(
				_.reduce(
					members,
					(districts, member) => {
						if (!districts[member.state]) {
							districts[member.state] = [];
						}

						districts[member.state].push(Number(member.district));

						return districts;
					},
					{}
				),
				(sorted, districts, state) => {
					sorted[state] = districts.sort((a, b) => a - b);

					return sorted;
				},
				{}
			)
		);
	}

	static getMemberInfo({ state, district, chamber = null, congress = LATEST_CONGRESS_NUMBER }) {
		const promises = [];

		if (!chamber || chamber === "house") {
			promises.push(CongressDataStore.getHouseMembers({ congress }));
		}

		if (!chamber || chamber === "senate") {
			promises.push(CongressDataStore.getSenateMembers({ congress }));
		}

		return Promise.all(promises).spread(
			(...members) => {
				return [].concat(...members).filter(
					member => member.state === state && (
						member.chamber === "senate" || Number(member.district) === Number(district)
					)
				);
			}
		);
	}
};
