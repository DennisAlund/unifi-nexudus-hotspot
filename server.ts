#!/usr/bin/env node

/**
 * Module dependencies.
 */

import * as app from "./app";
import * as debug from "debug"
import * as http from "http";

const debugLog = debug("unifi-nexudus-hotspot:server");

// The default URL for which to redirect to, if no URL is given from the device login request
const redirectUrl = process.env.DEFAULT_REDIRECT_URL || "https://www.kumpul.co";
app.hotspot.set('redirect_url', redirectUrl);
debugLog(`redirectUrl: ${redirectUrl}`);

// Short name of your Nexudus site. This value *must* be overridden
const nexudusSpaceName = process.env.NEXUDUS_SPACE_NAME || "nexudus";
app.hotspot.set('nexudus_space_name', nexudusSpaceName);
debugLog(`nexudusSpaceName: ${nexudusSpaceName}`);

// The UniFi Site name is "default" ... by default. 
// It is the short name of the controller and if it's not "default" then you are probably aware of it
const unifiSiteName = process.env.UNIFI_SITE_NAME || "default";
app.hotspot.set('unifi_site_name', unifiSiteName);
debugLog(`unifiSiteName: ${unifiSiteName}`);

// The controller is using SSL by default. Set to "false" to prevent calling HTTPS
const unifiUseSsl = process.env.UNIFI_USE_SSL || true;
app.hotspot.set('unifi_use_ssl', unifiUseSsl);
debugLog(`unifiUseSsl: ${unifiUseSsl}`);

// Whether the controller SSL certificate is self signed or not. 
const unifiSslIsSelfSigned = process.env.UNIFI_SSL_SELF_SIGNED || false;
app.hotspot.set('unifi_ssl_is_self_signed', unifiSslIsSelfSigned);
debugLog(`unifiSslSelfSigned: ${unifiSslIsSelfSigned}`);

// The domain name or IP of the controller.
const unifiDomain = process.env.UNIFI_DOMAIN || "127.0.0.1";
app.hotspot.set('unifi_domain', unifiDomain);
debugLog(`unifiDomain: ${unifiDomain}`);

// The port on which the controller responds to REST/HTTP calls
const unifiPort = process.env.UNIFI_PORT || "8443";
app.hotspot.set('unifi_port', unifiPort);
debugLog(`unifiPort: ${unifiPort}`);

// The full controller URL is composed of configuration values above
const unifiUrl = `http${(unifiUseSsl ? "s" : "")}://${unifiDomain}:${unifiPort}`
app.hotspot.set('unifi_url', unifiUrl);
debugLog(`unifiUrl: ${unifiUrl}`);

// UniFi controller admin user name. This is needed to login authorize calls to the API.
const unifiUsername = process.env.UNIFI_ADMIN_USER || "admin";
app.hotspot.set('unifi_username', unifiUsername);
debugLog(`unifiUsername: ${unifiUsername}`);

// UniFi controller admin password. This is needed to login authorize calls to the API.
// This value *must* be overridden
const unifiPassword = process.env.UNIFI_ADMIN_PASSWORD;
app.hotspot.set('unifi_password', unifiPassword);
debugLog("unifiPassword: " + (unifiPassword ? "*****" : typeof unifiPassword));

// The port on which to serve this application on
const port = process.env.PORT || '8080';
app.hotspot.set('port', port);
debugLog(`port: ${port}`);


/**
 * Create HTTP server.
 */

const server = http.createServer(app.hotspot);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}


/** 
 * Event listener for HTTP server "listening" event. 
 */ 
 
function onListening() { 
  const addr = server.address(); 
  const bind = typeof addr === 'string' 
    ? 'pipe ' + addr 
    : 'port ' + addr.port; 
  debugLog('Listening on ' + bind); 
}