import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import App from "./components/App";
import Home from "./components/Home";
import Settings from "./components/Settings";
import Groups from "./components/Groups";

ReactDOM.render(
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<IndexRoute component={Home} />

			<Route path="/settings" component={Settings} />
			<Route path="/groups" component={() => <Groups groups={[{name: 'foo'}]} />} />
			<Route path="/logout" />
		</Route>
	</Router>,
	document.getElementById('app')
);
