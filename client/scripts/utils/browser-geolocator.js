import Promise from "bluebird";

export default {
	getCurrentPosition() {
		return new Promise(
			(resolve, reject) => {
				if (!("geolocation" in navigator)) {
					const err = new Error("Geolocation API not supported in this browser");
					err.code = "NOT_SUPPORTED";
					reject(err);
					return;
				}

				navigator.geolocation.getCurrentPosition(
					position => {
						resolve(position);
					},
					err => {
						reject(err);
					}
				);
			}
		);
	}
};
