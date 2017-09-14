import * as express from "express";
import * as rp from "request-promise";
import * as tough from "tough-cookie";
import * as cookieParser from "set-cookie-parser";
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
        await activateDeviceOnHotspot(mac, ap);
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

async function activateDeviceOnHotspot(mac, ap) {
    const unifiUrl = app.hotspot.get('unifi_url');
    const siteName = app.hotspot.get('site_name');
    const apiAdminUser = app.hotspot.get('unifi_username');
    const apiAdminPassword = app.hotspot.get('unifi_password');

    // Save login cookies here
    const cookieJar = rp.jar();
    
    // The UniFi controller runs on HTTPS, but not neccesrily with a proper certificate
    // Ignore rejection if the certificate is self signed and everyone is happy with that
    if (app.hotspot.get('unifi_ssl_is_self_signed')) {
        debugLog("Ignoring self signed certificate warnings");
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    debugLog(`Logging in ${apiAdminUser} at UniFi guest portal ...`);
    const loginResponse = await rp({
        method: "POST",
        uri: `${unifiUrl}/api/login`,
        resolveWithFullResponse: true,
        jar: cookieJar,
        json: true,
        body: {
            "username": apiAdminUser,
            "password": apiAdminPassword
        }
    });

    // Save the login cookie
    cookieParser.parse(loginResponse).forEach(cookie => {
        debugLog("Setting cookie: " + JSON.stringify(cookie));
        cookieJar.setCookie(new tough.Cookie(cookie), unifiUrl);            
    });

    // Now send over and authorize the device MAC 
    debugLog(`Authorizing device "${mac}" at access point "${ap}"...`);
    await rp({
        method: "POST",
        uri: `${unifiUrl}/api/s/${siteName}/cmd/stamgr`,
        jar: cookieJar,
        json: true,
        body: {
            "cmd": "authorize-guest",
            "mac": mac,
            "ap": ap,
            "minutes": 60 * 24
        }
    });
    
    // The logout response likes to throw a HTTP 302 "error". So we'll catch it and ignore it.
    try {
        debugLog(`Logging out api user "${apiAdminUser}" from controller ...`);
        await rp({
            method: "POST",
            uri: `${unifiUrl}/logout`,
            jar: cookieJar
        });
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