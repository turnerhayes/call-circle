import $       from "jquery";
import Promise from "bluebird";

export default class CongressDataUtils {
	static getDistricts() {
		return Promise.resolve(
			$.ajax({
				"url": "/api/congress/districts",
				"dataType": "json",
				"type": "get"
			}).catch(
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
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
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
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
				(jqXHR, textStatus) => {
					throw new Error(textStatus);
				}
			)
		);
	}
}
