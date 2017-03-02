import ReactDOM from "react-dom";
import React from "react";
import { Router, Route, browserHistory, IndexRoute } from "react-router";
import UserUtils from "./utils/user";
import App from "./components/App";
import Home from "./components/Home";
import SiteAdmin from "./components/SiteAdmin";
import Settings from "./components/Settings";
import Groups from "./components/Groups";
import Issues from "./components/Issues";
import AddIssue from "./components/issues/Add";
import EditIssue from "./components/issues/Edit";
import IssueDetails from "./components/issues/Details";
import IssueSearch from "./components/issues/Search";

ReactDOM.render(
	<Router history={browserHistory}>
		<Route name="Home" path="/" component={App}>
			<IndexRoute component={Home} />

			{
				!UserUtils.currentUser.isAdmin ?
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
			<Route
				name="Groups"
				path="/groups"
				component={() => <Groups groups={[{"name": "foo"}]} />} />
			<Route name="Issues" path="/issues">
				<IndexRoute
					component={() => <Issues user={UserUtils.currentUser} />} />

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
	</Router>,
	document.getElementById("app")
);
