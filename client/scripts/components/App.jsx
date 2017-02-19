import React from "react";
import { withRouter } from "react-router";
import TopNavigation from "./TopNavigation";
import "bootstrap/dist/js/bootstrap.js";
import "page-layout.less";

class App extends React.Component {
	static propTypes = {
		"children": React.PropTypes.oneOfType([
			React.PropTypes.arrayOf(React.PropTypes.node),
			React.PropTypes.node
		])
	}

	static defaultProps = {
		"children": []
	}

	render() {
		return (
			<section className="page-layout__main-container">
				<header>
					<TopNavigation />
				</header>
				<article className="page-layout__main-content">
					{this.props.children}
				</article>
			</section>
		);
	}
}

export default withRouter(App);
