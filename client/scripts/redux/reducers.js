import { combineReducers } from "redux-immutable";
import usersReducer        from "project/scripts/redux/reducers/users";
import issuesReducer       from "project/scripts/redux/reducers/issues";
import issueImagesReducer  from "project/scripts/redux/reducers/issue-images";
import congressDataReducer from "project/scripts/redux/reducers/congress";
import routerReducer       from "project/scripts/redux/reducers/router";

const app = combineReducers({
	"users": usersReducer,
	"issues": issuesReducer,
	"issueImages": issueImagesReducer,
	"congress": congressDataReducer,
	"routing": routerReducer
});

export default app;
