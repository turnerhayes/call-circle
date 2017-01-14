const _                  = require('lodash');
const express            = require('express');
const session            = require('express-session');
const path               = require('path');
const favicon            = require('static-favicon');
const logger             = require('morgan');
const cookieParser       = require('cookie-parser');
const bodyParser         = require('body-parser');
const handlebars         = require('handlebars');
const hbs                = require('express-hbs');
const pg                 = require('pg');
const pgSession          = require('connect-pg-simple')(session);
const Config             = require('../lib/config');
const passportMiddleware = require('../lib/passport');

const app = express();

app.locals.IS_DEVELOPMENT = Config.app.isDevelopment;

const TEMPLATES_DIR = path.join(__dirname, 'views');

// view engine setup
app.engine(
	'hbs',
	hbs.express4({
		partialsDir: TEMPLATES_DIR,
		layoutsDir: TEMPLATES_DIR,
		handlebars: handlebars
	})
);

handlebars.registerHelper('ToJSON', function(value, options) {
	const args = [value];

	if (options.hash.pretty) {
		args.push(null, '\t');
	}

	return JSON.stringify.apply(JSON, args);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(session({
	store: new pgSession({
		pg: pg,
		conString: Config.session.db.url || {
			user: Config.session.db.username,
			password: Config.session.db.password,
			host: Config.session.db.host,
			database: Config.session.db.databaseName
		}
	}),
	secret: Config.session.secret,
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days 
}));

passportMiddleware(app);

// app.use('/', require('./routes/authentication'));
// app.use('/', require('./routes/pages'));

app.use(
	'/static/fonts/font-awesome',
	express.static(
		path.resolve(__dirname, '..', 'node_modules', 'font-awesome', 'fonts'),
		{
			fallthrough: false
		}
	)
);

if (Config.app.isDevelopment) {
	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');

	const webpackConfig = require('../webpack.config.js');
	const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

	_.each(
		webpackConfig.entry,
		(entry, key) => {
			if (_.isString(entry)) {
				webpackConfig.entry[key] = entry = [entry];
			}

			entry.push(hotMiddlewareScript);

			entry.unshift('react-hot-loader/patch');
		}
	);

	webpackConfig.plugins.push(
		// Webpack 1.0
		new webpack.optimize.OccurenceOrderPlugin(),
		// Webpack 2.0 fixed this mispelling
		// new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
    );

	const compiler = webpack(webpackConfig);

	app.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		noInfo: true,
		stats: {
			colors: true
		}
	}));

	app.use(webpackHotMiddleware(compiler));
}
// In production, serve resources pre-built by webpack
else {
	app.use('/static/', express.static(Config.paths.dist));
}

app.get(
	'*',
	function(req, res) {
		res.render('page', {
			title: 'Call Circle',
			req: req
		});
	}
);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: Config.app.isDevelopment ? err : {}
	});
});


module.exports = app;
