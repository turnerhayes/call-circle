import { createStore, applyMiddleware } from "redux";
import { createLogger }                 from "redux-logger";
import thunkMiddleware                  from "redux-thunk";
import promiseMiddleware                from "redux-promise";
import { persistState }                 from "redux-devtools";
import { composeWithDevTools }          from "redux-devtools-extension";
import { Map }                          from "immutable";
import invariant                        from "redux-immutable-state-invariant";
import rootReducer                      from "project/scripts/redux/reducers";
import Config                           from "project/shared-lib/config";


function getDebugSessionKey() {
	const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
	return (matches && matches.length > 0)? matches[1] : null;
}

const loggerMiddleware = createLogger();

const middlewares = [
	thunkMiddleware,
	promiseMiddleware
];

if (Config.app.isDevelopment) {
	middlewares.unshift(invariant());
	middlewares.push(loggerMiddleware);
}

const composeEnhancers = composeWithDevTools({
	"serialize": true
});

export default function configureStore(preloadedState) {
	return createStore(
		rootReducer,
		preloadedState || Map(),
		composeEnhancers(
			applyMiddleware(...middlewares),
			persistState(getDebugSessionKey())
		)
	);
}
