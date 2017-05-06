import { combineReducers } from "redux-immutable";
import issuesReducer       from "project/scripts/redux/reducers/issues";
import issueImagesReducer  from "project/scripts/redux/reducers/issue-images";
import congressReducer     from "project/scripts/redux/reducers/congress";

const app = combineReducers({
	"issues": issuesReducer,
	"issueImages": issueImagesReducer,
	"congress": congressReducer,
});

export default app;
