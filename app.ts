import * as express from "express";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as eh from "./request-handlers/errors";
import * as index from "./request-handlers/index";
import * as authenticate from "./request-handlers/authenticate";

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Setup routing
app.use(express.static(path.join(__dirname, 'public')));
app.use("/", index.router);
app.use("/authenticate", authenticate.router);

app.use(eh.notFound);
app.use(eh.error);

export const hotspot = app;