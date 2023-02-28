const User = require("../../models/user.model");
const pushEmail = require("../../util/awsSendEmail");
const template = require("../../templates/verifiedEmail");
const respond = require("../../util/sendResponse");

module.exports = async (req, res) => {
    const { email, token } = req.query;

    // simple validation
    if (!token || !email) {
        return respond(res, null, "Invalid request");
    }

    const user = await User.findOne({
        account_email: email,
        emailVerificationToken: token,
        is_activated: false,
    });

    if (!user) {
        return respond(res, null, "Invalid token");
    }

    try {
        user.emailVerificationDate = Date.now();
        user.emailVerificationToken = undefined;
        user.is_activated = true;
        await user.save({ validateBeforeSave: false });

        const message = template();

        await pushEmail({
            email: user.account_email,
            subject: "Email Verified",
            message: message,
            source: "vendgram@vendgram.co",
        });
        sendTokenResponse(user, res, respond);
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

// Get token from model and send response
const sendTokenResponse = (user, res, respond) => {
    const token = user.genSignedToken();
    const data = {
        email: user?.account_email,
        hasComplianceApproved: user?.hasComplianceApproved,
        hasCompliance: user?.hasCompliance,
        token,
    };
    respond(res, data, "User verified successfully", 200, true);
};
