#!/usr/bin/env node

/**
 * Module dependencies.
 */

import * as app from "./app";
import * as http from "http";
import * as debug from "debug"

const debugLog = debug("unifi-nexudus-hotspot:server");


app.hotspot.set('redirect_url', process.env.DEFAULT_REDIRECT_URL);
app.hotspot.set('nexudus_space_name', process.env.NEXUDUS_SPACE_NAME);
app.hotspot.set('unifi_use_ssl', process.env.UNIFI_USE_SSL);
app.hotspot.set('unifi_ssl_is_self_signed', process.env.UNIFI_SSL_SELF_SIGNED);
app.hotspot.set('unifi_host', process.env.UNIFI_HOST);
app.hotspot.set('unifi_port', process.env.UNIFI_PORT);
app.hotspot.set('unifi_username', process.env.UNIFI_ADMIN_USER);
app.hotspot.set('unifi_password', process.env.UNIFI_ADMIN_PASSWORD);
app.hotspot.set('port', process.env.PORT);

app.bootstrap();

/**
 * Create HTTP server.
 */

const server = http.createServer(app.hotspot);

/**
 * Listen on provided port, on all network interfaces.
 */
const port = app.hotspot.get("port");
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