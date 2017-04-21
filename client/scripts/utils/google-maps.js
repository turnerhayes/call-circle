import {
	uniqueId
}              from "lodash";
import Promise from "bluebird";
import APIKey  from "project/scripts/api-keys";

const callbackName = uniqueId("google_maps_callback");

export default new Promise(
	(resolve, reject) => {
		window[callbackName] = function() {
			resolve(window.google);
			delete window[callbackName];
		};

		const url = `https://maps.googleapis.com/maps/api/js?key=${APIKey.google.maps.key}&callback=${callbackName}&` +
			"libraries=" + [
				"places"
			].join(",");

		const script = document.createElement("script");
		script.src = url;
		script.async = true;
		script.onerror = () => {
			reject("Error loading Google Maps API script");
		};

		document.body.appendChild(script);
	}
);
