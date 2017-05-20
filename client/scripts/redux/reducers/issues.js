import { Map, fromJS }         from "immutable";
import IssuesStateRecord from "project/scripts/records/state/issues";
import {
	FETCH_ISSUES,
	CREATE_ISSUE,
	EDIT_ISSUE,
	CHANGE_ISSUE_SEARCH_PARAMETERS,
	SEARCH_ISSUES
}                         from "project/scripts/redux/actions";

export default function issuesReducer(state = new IssuesStateRecord(), action) {
	switch (action.type) {
		case FETCH_ISSUES: {
			if (action.error) {
				return state.set("issueLoadError", fromJS(action.payload));
			}

			return state.updateIssues(action.payload).delete("issueLoadError");
		}

		case CREATE_ISSUE: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(["items", action.payload.id], action.payload);
		}

		case EDIT_ISSUE: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(["items", action.payload.id], action.payload);
		}

		case CHANGE_ISSUE_SEARCH_PARAMETERS: {
			return state.mergeIn(
				["search", "parameters"],
				action.payload
			);
		}

		case SEARCH_ISSUES: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(
				["search", "results"],
				action.payload.map(issue => issue.id).toSet()
			).mergeIn(["items"], Map(action.payload.map(issue => [issue.id, issue])));
		}

		default:
			return state;
	}
}
