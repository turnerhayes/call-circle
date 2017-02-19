import $ from "jquery";

export default class CongressDataUtils {
	static getDistricts() {
		return $.ajax({
			"url": "/api/congress/districts",
			"dataType": "json",
			"type": "get"
		}).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static getHouseMembers() {
		return $.ajax({
			"url": "/api/congress/house",
			"dataType": "json",
			"type": "get"
		}).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}

	static getSenateMembers() {
		return $.ajax({
			"url": "/api/congress/senate",
			"dataType": "json",
			"type": "get"
		}).catch(
			(jqXHR, textStatus) => {
				throw new Error(textStatus);
			}
		);
	}
}
