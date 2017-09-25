import * as express from "express";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as errors from "./request-handlers/errors";
import * as index from "./request-handlers/index";
import * as authenticate from "./request-handlers/authenticate";
import * as debug from "debug"

const debugLog = debug("unifi-nexudus-hotspot:app");
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

app.use(errors.notFound);
app.use(errors.error);

export const hotspot = app;

export const bootstrap = () => {

    // The default URL for which to redirect to, if no URL is given from the device login request
    setEnvironmentVariableOrDefault("redirect_url", "https://www.kumpul.co");

    // Short name of your Nexudus site. This value *must* be overridden
    setEnvironmentVariableOrDefault("nexudus_space_name", "nexudus");

    // The controller is using SSL by default. Set to "false" to prevent calling HTTPS
    setEnvironmentVariableOrDefault("unifi_use_ssl", true);

    // Whether the controller SSL certificate is self signed or not. 
    setEnvironmentVariableOrDefault("unifi_ssl_is_self_signed", false);

    // The domain name or IP of the controller.
    setEnvironmentVariableOrDefault("unifi_host", "127.0.0.1");

    // The port on which the controller responds to REST/HTTP calls
    setEnvironmentVariableOrDefault("unifi_port", "8443");

    // UniFi controller admin user name. This is needed to login authorize calls to the API.
    setEnvironmentVariableOrDefault("unifi_username", "admin");

    // UniFi controller admin password. This is needed to login authorize calls to the API.
    // This value *must* be overridden
    setEnvironmentVariableOrDefault("unifi_password", "");

    // The port on which to serve this application on
    setEnvironmentVariableOrDefault("port", "8080");
    
    const unifiUseSsl = app.get("unifi_use_ssl");
    const unifiHost = app.get("unifi_host");
    const unifiPort = app.get("unifi_port");

    // The full controller URL is composed of configuration values above
    const unifiUrl = `http${(unifiUseSsl ? "s" : "")}://${unifiHost}:${unifiPort}`
    app.set("unifi_url", unifiUrl);
    debugLog(`unifi_url: ${unifiUrl}`);

    function setEnvironmentVariableOrDefault(name:string, defaultValue:any) {
        const configuredValue = app.get(name);
        if (typeof configuredValue === "undefined" || configuredValue === "") {
            app.set(name, defaultValue);            
            debugLog(`${name} [default]: ${defaultValue}`);
        } else {
            debugLog(`${name}: ${configuredValue}`);
        }
    }
}