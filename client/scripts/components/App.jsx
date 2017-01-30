import React from "react";
import { Link, withRouter } from "react-router";
import Breadcrumbs from "react-breadcrumbs";
import "bootstrap/dist/js/bootstrap.js";
import "breadcrumbs.less";
import "page-layout.less";

class App extends React.Component {
	render() {
		return (
			<section className="page-layout__main-container">
				<header>
					<Breadcrumbs
						routes={this.props.routes}
						params={this.props.params}
						separator=" / "
						setDocumentTitle={true}
					/>
				</header>
				<article className="page-layout__main-content">
					{this.props.children}
				</article>
			</section>
		);
	}
}

export default withRouter(App);
