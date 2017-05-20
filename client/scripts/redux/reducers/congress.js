import { Map } from "immutable";

import {
	GET_CONGRESSIONAL_REPRESENTATIVES,
	GET_CONGRESSIONAL_DISTRICTS,
} from "project/scripts/redux/actions";

export default function congressDataReducer(state = Map(), action) {
	switch (action.type) {
		case GET_CONGRESSIONAL_REPRESENTATIVES: {
			if (action.error) {
				return state.set("representativesLoadError", action.payload);
			}

			return state.mergeIn(
				["items"],
				Map(
					action.payload.map(
						rep => [rep.id, rep]
					)
				),
			).delete("representativesLoadError");
		}

		case GET_CONGRESSIONAL_DISTRICTS: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.mergeIn(["districts"], action.payload);
		}

		default:
			return state;
	}
}
