const User = require("../../models/user.model");
const pushEmail = require("../../util/awsSendEmail");
const config = require("../../config/config");
const template = require("../../templates/recoverUserTemplate");
const respond = require("../../util/sendResponse");

module.exports = async (req, res) => {
    const { email } = req.body;

    // simple validation
    if (!email) {
        return respond(res, null, "Invalid request");
    }

    // check if email exists
    const user = await User.findOne({ account_email: email });

    if (!user) {
        return respond(res, null, "User does not exist");
    }

    if (!user?.is_activated) {
        return respond(res, null, "Unverified User");
    }

    try {
        // Generate reset token
        const resetPasswordToken = user.genResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const path = `?token=${resetPasswordToken}&email=${user?.account_email}`;
        const recoverPasswordUrl = `${config.recover_user_url}/${path}`;

        if (recoverPasswordUrl) {
            const message = template(recoverPasswordUrl);

            await pushEmail({
                email: user?.account_email,
                subject: "Recover your Password on Vendgram",
                message: message,
                source: "vendgram@vendgram.co",
            });

            respond(res, null, "Reset password link has been sent", 200, true);
        }
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};
