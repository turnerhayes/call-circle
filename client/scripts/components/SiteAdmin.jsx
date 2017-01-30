import React from "react";
import { withRouter } from "react-router";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

class SiteAdmin extends React.Component {
	state = {
		selectedTabIndex: 1
	}

	handleTabSelect(index, last) {
		this.setState({selectedTabIndex: index});
	}

	render() {
		return (
			<div>
				<Tabs
					onSelect={(index, last) => this.handleTabSelect(index, last)}
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
