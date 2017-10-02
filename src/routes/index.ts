import * as express from "express";
import * as debug from "debug"
import * as app from "../app";

const debugLog = debug("unifi-nexudus-hotspot:router:index");

declare var process: any;

export const router = express.Router();

router.get("/guest/s/:sitename", (req, res, next) => {
    debugLog("Request params: " + JSON.stringify(req.query));

    // TODO: Check with external API if MAC is existing

    var templateAttributes = {
        title: "Hotspot Login",
        sitename: req.params.sitename,
        host: app.hotspot.get('unifi_host'),
        mac: req.query.id, // The connecting device's MAC address
        ap: req.query.ap, // MAC address of the AP that device is connecting to
        url: req.query.url || app.hotspot.get("redirect_url"),
        timestamp: req.query.t,
        ssid: req.query.ssid
    };

    debugLog("Template attributes: " + JSON.stringify(templateAttributes, null, 2));
    if (!templateAttributes.mac || !templateAttributes.ap) {
        return next({
            message: "Missing MAC address. Don't access this page manually!",
            status: 400
        });
    }

    res.render("index", templateAttributes);
});