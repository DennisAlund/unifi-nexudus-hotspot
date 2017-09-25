import * as functions from "firebase-functions";

import * as app from "./app";

export const hotspot = functions.https.onRequest(app.hotspot);