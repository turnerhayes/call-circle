"use strict";

const express            = require("express");
const session            = require("express-session");
const path               = require("path");
// const favicon            = require("serve-favicon");
const cookieParser       = require("cookie-parser");
const bodyParser         = require("body-parser");
const busboy             = require("connect-busboy");
const handlebars         = require("handlebars");
const hbs                = require("express-hbs");
const pg                 = require("pg");
const pgSession          = require("connect-pg-simple")(session);
const cors               = require("cors");
const HTTPStatusCodes    = require("http-status-codes");
const rfr                = require("rfr");
const Loggers            = rfr("server/lib/loggers");
const Config             = rfr("server/lib/config");
const passportMiddleware = rfr("server/lib/passport");

const app = express();

app.locals.IS_DEVELOPMENT = Config.app.isDevelopment;

const TEMPLATES_DIR = path.join(__dirname, "views");

const SITE_RESTRICTED_CORS_OPTIONS = {
	"origin": Config.app.address.origin
};

function raise404(req, res, next) {
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
}

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
app.use(bodyParser.urlencoded({
	"extended": true
}));
app.use(busboy());
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

app.use("/", cors(SITE_RESTRICTED_CORS_OPTIONS), require("./routes/authentication"));
app.use("/api", cors(), require("./routes/api"));

// Make sure no /api calls get caught by the below catch-all route handler, so that
// /api calls can 404 correctly
app.use("/api/*", raise404);

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
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
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
	cors(SITE_RESTRICTED_CORS_OPTIONS),
	(req, res, next) => {
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
app.use(raise404);

/// error handlers

// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
	res.status(err.status || HTTPStatusCodes.INTERNAL_SERVER_ERROR);

	const errData = {
		"message": err.message,
		"error": Config.app.isDevelopment ?
			{
				"message": err.message,
				"stack": err.stack
			} :
			{}
	};

	if (err.status !== HTTPStatusCodes.NOT_FOUND) {
		Loggers.errors.error(err);
	}

	res.format({
		"json": () => res.json(errData),
		"default": () => res.render("error", errData)
	});
});


module.exports = app;
