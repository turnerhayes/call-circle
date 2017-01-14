import ReactDOM from "react-dom";
import App from "../components/App";
import GroupsManagement from "../components/groups/Management";
import UserUtils from "../utils/user";

ReactDOM.render(
	<App>
		<GroupsManagement
			user={UserUtils.currentUser}
		/>
	</App>,
	document.getElementById('app')
);
