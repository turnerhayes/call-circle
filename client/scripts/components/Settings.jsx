import React from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

let _componentID = 0;

class Settings extends React.Component {
	state = {
		selectedTabIndex: 0,
		contactPreferences: {
			email: ''
		}
	}

	componentID = `settings-component-${_componentID++}`

	handleTabSelect(index, last) {
		this.setState({selectedTabIndex: index});
	}

	render() {
		return (
			<div
				className="user-settings"
			>
				<Tabs
					onSelect={(index, last) => this.handleTabSelect(index, last)}
					selectedIndex={this.state.selectedTabIndex}
				>
					<TabList>
						<Tab>Contact</Tab>
					</TabList>

					<TabPanel>
						<form
							method="post"
							action={document.location}
						>
							<h3>Contact Preferences</h3>
							<div className="form-group">
								<label
									className="sr-only"
									htmlFor={`${this.componentID}-email`}
								>Email</label>
								<input
									type="email"
									id={`${this.componentID}-email`}
									className="form-control"
									placeholder="Email Address"
									defaultValue={this.state.contactPreferences.email}
									onChange={
										event => {
											this.setState({
												contactPreferences: Object.assign(
													{},
													this.state.contactPreferences,
													{
														email: event.target.value
													}
												)
											});
										}
									}
								/>
							</div>
						</form>
					</TabPanel>
				</Tabs>
			</div>
		);
	}
}

export default Settings;
