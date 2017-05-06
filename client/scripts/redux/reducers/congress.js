import { Map } from "immutable";

import {
	GET_CONGRESSIONAL_REPRESENTATIVES,
} from "project/scripts/redux/actions";

export default function issuesReducer(state = Map(), action) {
	switch (action.type) {
		case GET_CONGRESSIONAL_REPRESENTATIVES: {
			if (action.error) {
				return state.set("representativesLoadError", action.payload);
			}

			return state.set(
				"items", (state.items || Map()).merge(
					Map(
						action.payload.map(
							rep => [rep.get("id"), rep]
						)
					)
				),
			).delete("representativesLoadError");
		}
		default:
			return state;
	}
}
