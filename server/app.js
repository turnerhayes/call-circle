"use strict";

const express            = require("express");
const session            = require("express-session");
const path               = require("path");
const Loggers            = require("./lib/loggers");
// const favicon            = require("serve-favicon");
const cookieParser       = require("cookie-parser");
const bodyParser         = require("body-parser");
const handlebars         = require("handlebars");
const hbs                = require("express-hbs");
const pg                 = require("pg");
const pgSession          = require("connect-pg-simple")(session);
const Config             = require("../lib/config");
const passportMiddleware = require("../lib/passport");

const app = express();

app.locals.IS_DEVELOPMENT = Config.app.isDevelopment;

const TEMPLATES_DIR = path.join(__dirname, "views");

// view engine setup
app.engine(
	"hbs",
	hbs.express4({
		"partialsDir": TEMPLATES_DIR,
		"layoutsDir": TEMPLATES_DIR,
		"handlebars": handlebars
	})
);

handlebars.registerHelper("ToJSON", function(value, options) {
	const args = [value];

	if (options.hash.pretty) {
		args.push(null, "\t");
	}

	return JSON.stringify.apply(JSON, args);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// app.use(favicon());
app.use(Loggers.http);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// eslint-disable-next-line no-magic-numbers
const THIRTY_DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

app.use(session({
	"store": new pgSession({
		"pg": pg,
		"conString": Config.session.db.url || {
			"user": Config.session.db.username,
			"password": Config.session.db.password,
			"host": Config.session.db.host,
			"database": Config.session.db.databaseName
		}
	}),
	"secret": Config.session.secret,
	"resave": false,
	"saveUninitialized": false,
	"cookie": { "maxAge": THIRTY_DAYS_IN_MILLISECONDS }
}));

passportMiddleware(app);

app.use(
	"/static/fonts/font-awesome",
	express.static(
		// Need to do this ugly resolve; using requre.resolve() doesn't seem to work,
		// possibly because the font-awesome package contains no main entry or index.js,
		// so Node treats it as not a package.
		path.resolve(__dirname, "..", "node_modules", "font-awesome", "fonts"),
		{
			"fallthrough": false
		}
	)
);

app.use("/", require("./routes/authentication"));
app.use("/api", require("./routes/api"));

if (Config.app.isDevelopment) {
	const webpack = require("webpack");
	const webpackDevMiddleware = require("webpack-dev-middleware");
	const webpackHotMiddleware = require("webpack-hot-middleware");

	const webpackConfig = require("../webpack.config.js");

	webpackConfig.entry = [
		"react-hot-loader/patch",
		"webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true",
		webpackConfig.entry
	];

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
		"publicPath": webpackConfig.output.publicPath,
		"noInfo": true,
		"stats": {
			"colors": true
		}
	}));

	app.use(webpackHotMiddleware(compiler));
}
// In production, serve resources pre-built by webpack
else {
	app.use("/static/", express.static(Config.paths.dist));
}

app.get(
	"*",
	function(req, res, next) {
		// If what we're serving is supposed to be HTML, serve the base page.
		if (req.accepts(["html", "json"]) === "html") {
			res.render("index", {
				"req": req
			});
		}
		else {
			next();
		}
	}
);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
});

/// error handlers

app.use(function(err, req, res) {
	// eslint-disable-next-line no-magic-numbers
	res.status(err.status || 500);

	const errData = {
		"message": err.message,
		"error": Config.app.isDevelopment ?
			{
				"message": err.message,
				"stack": err.stack
			} :
			{}
	};

	// eslint-disable-next-line no-magic-numbers
	if (Config.app.isDevelopment && err.status !== 404) {
		// eslint-disable-next-line no-console
		console.error(err);
	}

	res.format({
		"json": () => res.json(errData),
		"default": () => res.render("error", errData)
	});
});


module.exports = app;
