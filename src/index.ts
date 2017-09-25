import * as functions from "firebase-functions";

import * as app from "./app";

app.hotspot.set('nexudus_space_name', functions.config().nexudus.shortname);
app.hotspot.set('redirect_url', functions.config().unifi.redirect_url);
app.hotspot.set('unifi_use_ssl', functions.config().unifi.use_ssl);
app.hotspot.set('unifi_ssl_is_self_signed', functions.config().unifi.is_selfsigned);
app.hotspot.set('unifi_host', functions.config().unifi.host);
app.hotspot.set('unifi_port', functions.config().unifi.port);
app.hotspot.set('unifi_username', functions.config().unifi.username);
app.hotspot.set('unifi_password', functions.config().unifi.password);

app.bootstrap();

export const hotspot = functions.https.onRequest(app.hotspot);