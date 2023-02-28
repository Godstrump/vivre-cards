const User = require("../../models/user.model");
const respond = require("../../util/sendResponse");

module.exports = async (req, res) => {
    const { email } = req.body;
    const token = req.params.token;

    // simple validation
    if (!token || !email) {
        return respond(res, null, "Invalid request");
    }

    const user = await User.findOne({
        account_email: email,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: new Date(Date.now()) },
        is_activated: true,
    });

    if (!user) {
        return respond(res, null, "Invalid token");
    }

    try {
        respond(res, null, "User verified successfully", 200, true);
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};
