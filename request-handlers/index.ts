import * as express from "express";
import * as debug from "debug"

const debugLog = debug("unifi-nexudus-hotspot:router:index");

declare var process: any;

export const router = express.Router();

router.get("/", (req, res, next) => {
    debugLog("Request params: " + JSON.stringify(req.params, null, " "));
 
    const mac = req.query.mac; // The connecting device's MAC address
    const ap = req.query.ap; // MAC address of the AP that device is connecting to 
    const url = req.query.url || process.env.DEFAULT_REDIRECT_URL || "https://www.kumpul.co";

    if (!mac || !ap) {
        return next({
            message: "Missing MAC address. Don't access this page manually!",
            status: 400
        });
    }
   
    // TODO: Check with external API if MAC is existing

    var templateAttributes = { 
        title: "Hotspot Login",
        mac: req.query.mac,
        ap: req.query.ap,
        url: req.query.url
    };

    res.render("index", templateAttributes);
});