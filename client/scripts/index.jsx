import $               from "jquery";
import ReactDOM        from "react-dom";
import React           from "react";
import {
	browserHistory,
	Router,
	Route,
	IndexRoute
}                      from "react-router";
import { Provider }     from "react-redux";
import {
	syncHistoryWithStore
}                       from "react-router-redux";
import { Map, fromJS }  from "immutable";
import configureStore   from "project/scripts/redux/configure-store";
import UserRecord       from "project/scripts/records/user";
import UsersStateRecord from "project/scripts/records/state/users";
import App              from "project/scripts/components/App";
import Home             from "project/scripts/components/Home";
import SiteAdmin        from "project/scripts/components/SiteAdmin";
import Settings         from "project/scripts/components/Settings";
import Issues           from "project/scripts/components/Issues";
import AddIssue         from "project/scripts/components/issues/Add";
import EditIssue        from "project/scripts/components/issues/Edit";
import IssueDetails     from "project/scripts/components/issues/Details";
import IssueSearch      from "project/scripts/components/issues/Search";
import UserProfile      from "project/scripts/components/user/Profile";

const currentUser = new UserRecord(fromJS($(document.body).data("user")));

const initialState = Map(
	{
		"users": new UsersStateRecord(
			{
				"currentID": currentUser.id,
				"items": Map([[currentUser.id, currentUser]])
			}
		)
	}
);

const store = configureStore(initialState);

const history = syncHistoryWithStore(browserHistory, store, {
	"selectLocationState": state => state.get("routing").toJS()
});

ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>
			<Route name="Home" path="/" component={App}>
				<IndexRoute component={Home} />

				{
					!currentUser.isAdmin ?
						(
							<Route
								name="Site Admin"
								path="/admin"
								component={SiteAdmin}
							/>
						) :
						""
				}
				<Route
					name="Settings"
					path="/settings"
					component={Settings} />
				<Route name="User Profile" path="/profile">
					<IndexRoute
						component={UserProfile}
					/>
				</Route>
				<Route name="Issues" path="/issues">
					<IndexRoute
						component={Issues} />

					<Route
						name="Search Issues"
						path="search"
						component={props => <IssueSearch search={props.location.query} />} />
					<Route
						name="Add Issue"
						path="add"
						component={AddIssue}
					/>
					<Route
						name="View Issue"
						staticName={true}
						path=":issueID"
						component={props => <IssueDetails issueID={parseInt(props.params.issueID, 10)} />} />
					<Route
						name="Edit Issue"
						staticName={true}
						path="edit/:issueID"
						component={props => <EditIssue issueID={parseInt(props.params.issueID, 10)} />} />
				</Route>
			</Route>
		</Router>
	</Provider>,
	document.getElementById("app")
);
