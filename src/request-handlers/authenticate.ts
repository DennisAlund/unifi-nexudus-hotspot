import * as express from "express";
import * as rp from "request-promise";
import * as unifi from "@oddbit/unifi";
import * as debug from "debug"
import * as app from "../app";

const debugLog = debug("unifi-nexudus-hotspot:router:authenticate");

export const router = express.Router();
router.post("/", async (req, res, next) => {
    debugLog(JSON.stringify(req.body, null, 2));

    const redirectUrl = req.body.url || app.hotspot.get("redirect_url");
    const mac = req.body.mac;
    const ap = req.body.ap;
    const email = req.body.email;
    const password = req.body.password;
    const sitename = req.body.sitename;

    // Check with Nexudus if the provided email/password is an active member
    let nexudusCoworker: NexudusCoworker;
    try {
        nexudusCoworker = await getNexudusCoworker(email, password);
    } catch (err) {
        debugLog("Error object: " + JSON.stringify(err, null, 2));
        console.error(`Could not connect to Nexudus: ${err.message}`);
        return next({
            message: err.message,
            status: err.statusCode
        });
    }

    // Stop the process if the visitor doesn't have a valid membership
    if (!nexudusCoworker.IsMember) {
        res.redirect(200, '/membership-expired.html');
        return;
    }

    // Activate MAC at hotspot
    try {
        await activateDeviceOnHotspot(sitename, mac, ap);
    } catch (err) {
        debugLog("Error object: " + JSON.stringify(err, null, 2));
        console.error(`Could not activate MAC '${mac}' at the hotspot: ${err.message}`);
        return next({
            message: err.message,
            status: err.statusCode
        });
    }

    // Send the visitor's device to the URL that was initially requested (or default)
    res.redirect(302, redirectUrl);
});

async function getNexudusCoworker(email: string, password: string) {
    const nexudusSpaceName = app.hotspot.get('nexudus_space_name');
    const credentials = new Buffer(`${email}:${password}`).toString("base64");
    const url = `https://${nexudusSpaceName}.spaces.nexudus.com/en/profile?_resource=Coworker`;
    var options = {
        method: "GET",
        uri: url,
        json: true,
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json"
        }
    };
    
    debugLog(`Getting coworker information for ${email} at ${nexudusSpaceName} ...`);
    const response = await rp(options);
    debugLog(`Cowoker is an active member: ${response.IsMember}`);

    return response;
}

async function activateDeviceOnHotspot(siteName: string, mac: string, ap: string) {
    const unifiHost = app.hotspot.get("unifi_host");
    const apiAdminUser = app.hotspot.get('unifi_username');
    const apiAdminPassword = app.hotspot.get('unifi_password');

    const controller = new unifi.UnifiController({
        host: unifiHost,
        isSelfSigned: true,
        siteName: siteName
    });
    
    debugLog(`Logging in ${apiAdminUser} at UniFi guest portal ...`);
    await controller.login(apiAdminUser, apiAdminPassword);

    debugLog(`Authorizing device "${mac}" at access point "${ap}"...`);
    await controller.authorizeClient(mac, ap);
    
    // The logout response likes to throw a HTTP 302 "error". So we'll catch it and ignore it.
    try {
        debugLog(`Logging out api user "${apiAdminUser}" from controller ...`);
        await controller.logout();
    } catch (err) {
        if (err.statusCode >= 400) {
            throw err;
        }
    }
}

interface NexudusCoworker {
    FullName: string,
    Email: string,
    Active: boolean,
    CheckedIn: boolean,
    IsMember: boolean,
    IsContact: boolean
}