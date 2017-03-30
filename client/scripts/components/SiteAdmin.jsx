import React                            from "react";
import { withRouter }                   from "react-router";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

class SiteAdmin extends React.Component {
	state = {
		"selectedTabIndex": 0
	}

	handleTabSelect = index => {
		this.setState({"selectedTabIndex": index});
	}

	render() {
		return (
			<div>
				<Tabs
					onSelect={this.handleTabSelect}
					selectedIndex={this.state.selectedTabIndex}
				>
					<TabList>
						<Tab>Users</Tab>
					</TabList>

					<TabPanel>
						<form
							method="post"
							action={document.location}
							encType="application/x-www-form-urlencoded"
						>
							<h3>Users</h3>
							<div className="form-group">
								
							</div>
						</form>
					</TabPanel>
				</Tabs>
			</div>
		);
	}
}

export default withRouter(SiteAdmin);
