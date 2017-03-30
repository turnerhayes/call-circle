import ReactDOM                                      from "react-dom";
import React                                         from "react";
import { Router, Route, browserHistory, IndexRoute } from "react-router";
import UserUtils                                     from "project/scripts/utils/user";
import App                                           from "project/scripts/components/App";
import Home                                          from "project/scripts/components/Home";
import SiteAdmin                                     from "project/scripts/components/SiteAdmin";
import Settings                                      from "project/scripts/components/Settings";
import Groups                                        from "project/scripts/components/Groups";
import Issues                                        from "project/scripts/components/Issues";
import AddIssue                                      from "project/scripts/components/issues/Add";
import EditIssue                                     from "project/scripts/components/issues/Edit";
import IssueDetails                                  from "project/scripts/components/issues/Details";
import IssueSearch                                   from "project/scripts/components/issues/Search";

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
