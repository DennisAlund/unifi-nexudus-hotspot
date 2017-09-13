import * as express from "express";
import * as rp from "request-promise";
import * as debug from "debug"

const debugLog = debug("unifi-nexudus-hotspot:router:authenticate");

export const router = express.Router();
router.post("/", async (req, res, next) => {
    debugLog(JSON.stringify(req.body, null, 2));

    // Check with Nexudus if the provided email/password is an active member
    let isActiveMember = false;
    try {
        const token = await getNexudusAuthorizationToken(req.body.email, req.body.password);
        isActiveMember = await isUserActiveMember(token);
    } catch (err) {
        debugLog("Error object: " + JSON.stringify(err, null, 2));
        console.error(`Could not connect to Nexudus!: ${err.message}`);
        return next(normalizeError(err));
    }

    // Activate MAC at hotspot
    try {
        await activateDeviceOnHotspot(req.body.mac);

        // Default behaviour is to take the visitor to the URL that was originally requested
        const redirectUrl = req.body.url || process.env.DEFAULT_REDIRECT_URL || "https://www.kumpul.co";
        res.redirect(302, redirectUrl);
    } catch (err) {

        debugLog("Error object: " + JSON.stringify(err, null, 2));
        console.error(`Could not activate MAC '${req.body.mac}' at the hotspot: ${err.message}`);
        return next(normalizeError(err));
    }
});

function normalizeError(err) {
    if (!!err.Status) {
        err.status = err.Status;
    }
    if (!!err.Message) {
        err.message = err.Message;
    }
    return err;
}

async function getNexudusAuthorizationToken(email, password) {
    var options = {
        method: "POST",
        uri: "https://spaces.nexudus.com/api/sys/users/token",
        body: {
            Email: email,
            Password: password,
            validityInMinutes: 5
        },
        json: true 
    };
    
    let err = {} as any;
    debugLog("Getting Nexudus auth token...");
    const response = await rp(options);
    debugLog("Nexudus auth token response: " + JSON.stringify(response, null, 2));

    if (!response.WasSuccessful) {
        console.warn(`Failed to validate credentials for ${email}`);
        throw {
            status: response.Status,
            message: response.Message
        };
    }

    debugLog(`Got auth token for ${email}: ${response.Value}`);
    return response.Value;
}

async function isUserActiveMember(token) {
    var options = {
        method: "GET",
        uri: "http://kumpul.spaces.nexudus.com/en/profile?_resource=Coworker",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        json: true 
    };
    
    let err = {} as any;
    debugLog("Getting coworker information...");
    const response = await rp(options);
    debugLog("Nexudus coworker response: " + JSON.stringify(response, null, 2));

    if (!response.WasSuccessful) {
        console.warn(`Failed to get coworker data: ${response.Message}`);
        throw {
            status: response.Status,
            message: response.Message
        };
    }

    debugLog(`Cowoker is an active member: ${response.IsMember}`);
    return response.IsMember;
}


async function activateDeviceOnHotspot(mac) {

}