const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const pushEmail = require("../../util/awsSendEmail");
const template = require("../../templates/resetTemplate");
const crypto = require("crypto");
const changeTemplate = require("../../templates/changedTemplate")
const respond = require("../../util/sendResponse");

exports.resetPassword = async (req, res) => {
    const resetToken = req.params.resetToken;
    const { new_password, email } = req.body;

    // simple validation
    if (!resetToken || !new_password) {
        return respond(res, null, "Invalid request");
    }

    // check for the user
    const user = await User.findOne({
        account_email: email.toLowerCase(),
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: new Date(Date.now()) },
    });

    if (!user) {
        return respond(res, null, "Invalid token");
    }

    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(new_password, salt);

    try {
        // set new password
        const email = user.account_email;
        user.account_password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        const message = template();

        await pushEmail({
            email: email,
            subject: "Password Reset",
            message: message,
            source: "vendgram@vendgram.co",
        });
        return respond(res, null, "User verified successfully", 200, true);
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};


exports.changePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const owner = req.user._id
        const user = await User.findOne({ _id: owner }).select("+account_password")
        const isMatch = await bcrypt.compare(password, user.account_password);
    
        if (!isMatch && !user) {
            return respond(res, null, "Invalid credentials");
        }

        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(newPassword, salt);
        user.account_password = hashedPassword;
        await user.save({ validateBeforeSave: false });

        const message = changeTemplate();

        await pushEmail({
            email: user?.account_email,
            subject: "Password Changed",
            message: message,
            source: "vendgram@vendgram.co",
        });
        return respond(res, null, 'User password changed', 201, true)
    } catch (error) {
        return respond(res, null, error.message, 500)
    }
    
}