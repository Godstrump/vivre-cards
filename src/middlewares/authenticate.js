const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const respond = require("../util/sendResponse");
const env = require("../config/config")

function verifyJwt(token, secret='') {
    try {
        let decoded;
        if (!secret) decoded = jwt.verify(token, env.access_secret);
        else decoded = jwt.verify(token, secret);
        return { valid: true, decoded, msg: null };
    } catch (err) {
        return {
            valid: false,
            msg: err.message,
            decoded: null,
        };
    }
}

const authUser = async (req, res, next) => {
    const accessToken = req.headers["x-access-token"];
    const rt = req.cookie?.refreshToken
    let message = "Access denied. No token provided.";

    if (!accessToken) {
        return respond(res, null, message);
    }

    const { decoded, valid, msg } = verifyJwt(accessToken);

    if (!valid) {
        message = msg;
        return respond(res, null, message, 401, false);
    }

    if (decoded) {
        const isUser = await User.findOne({ _id: decoded._id });
        if (!isUser) {
            message = "Invalid User.";
            return respond(res, null, message);
        } else {
            let token
            if (rt) {
                const { decoded: decodeRt, valid: validRt, expired: expiredRt, msg: msgRt } = verifyJwt(rt, env.refresh_secret)
                if (!validRt || expiredRt) {
                    return respond(res, null, msgRt, 403)
                } else {
                    const isToken = await User.findOne({ _id: decodeRt._id })
                    if (isToken) token = rt
                    else return respond(res, null, 'Unauthorized user', 403)
                }
            } else {
                token = null
            }
            
            req.user = isUser;
            req.token = accessToken;
            req.refreshToken = token
            return next();
        }
    }
};

const authAdmin = async (req, res, next) => {
    const adminToken = req.headers["x-admin-token"];

    if (!adminToken) {
        return respond(res, null, 'Access denied! No token provided')
    }

    const { decoded, valid, msg } = verifyJwt(adminToken, env.admin_secret);

    if (!valid) {
        return res
            .status(400)
            .send({ status: false, message: msg });
    }

    if (decoded) {
        req.admin = decoded;
        if (
            !req.admin.create === "all" &&
            !req.admin.read === "all" &&
            !req.admin.update === "all" &&
            !req.admin.delete === "all" &&
            !req.admin._id
        ) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid Admin" });
        } else {
            return next();
        }
    }
};

module.exports = { authUser, authAdmin };
