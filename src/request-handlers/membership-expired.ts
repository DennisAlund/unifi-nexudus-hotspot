import * as express from "express";
import * as debug from "debug"

const debugLog = debug("unifi-nexudus-hotspot:router:index");

declare var process: any;

export const router = express.Router();

router.get("/", (req, res, next) => {
    // TODO: Include URL to website where membership can be renewed    
    res.render("membership-expired", {});
});