import {
	uniqueId
}              from "lodash";
import Promise from "bluebird";
import APIKey  from "project/scripts/api-keys";


let _promise;

export default {
	get "promise"() {
		if (!_promise) {
			_promise = new Promise(
				(resolve, reject) => {
					const callbackName = uniqueId("google_maps_callback");

					window[callbackName] = function() {
						resolve(window.google);
						delete window[callbackName];
					};

					const url = `https://maps.googleapis.com/maps/api/js?key=${APIKey.google.maps.key}&callback=${callbackName}&libraries=places`;

					const script = document.createElement("script");
					script.src = url;
					script.async = true;
					script.onerror = () => {
						reject("Error loading Google Maps API script");
					};

					document.body.appendChild(script);
				}
			);
		}

		return _promise;
	}
};
