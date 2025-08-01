import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksClient from "jwks-rsa";
import config from "config";
import { Request } from "express";
import { AuthCookie } from "../types";

// This middleware stores the payload of the acces token in "req.auth" if the access token is valid:
export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: config.get("auth.JWKS_URI"),
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,

    algorithms: ["RS256"],

    getToken(req: Request) {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const accessToken = authHeader.split(" ")[1];
            return accessToken;
        }
        console.log("req.cookies", req.cookies);

        const { accessToken } = req.cookies as AuthCookie;

        return accessToken;
    },
});
