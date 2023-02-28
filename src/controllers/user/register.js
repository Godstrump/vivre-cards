const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const crypto = require("crypto");
const getEmailTemplate = require("../../templates/regTemplate");
const pushEmail = require("../../util/awsSendEmail");
const config = require("../../config/config");
const respond = require("../../util/sendResponse");
const { response } = require("express");

module.exports = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return respond(res, null, 'Please enter your email and password')
    }
    const user = await User.findOne({ account_email: email });
    if (user) {
        return respond(res, null, 'This email already exists')
    }

    try {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
        let emailVerificationToken = await crypto
            .randomBytes(20)
            .toString("hex");
        console.log("ev", emailVerificationToken);
        emailVerificationToken = await crypto
            .createHash("sha256")
            .update(emailVerificationToken)
            .digest("hex");

        const newUser = new User({
            account_email: email.toLowerCase(),
            account_password: hashedPassword,
            emailVerificationToken,
        });

        const user = await newUser.save();
        if (user) {
            // ?token=TOKEN&email=EMAIL
            const path = `?token=${emailVerificationToken}&email=${user?.account_email}`;
            const emailVerificationUrl = `${config.verify_email_urL}/${path}`;

            console.log("evu", emailVerificationUrl);

            const message = getEmailTemplate(
                user?.account_email,
                emailVerificationUrl
            );
            await pushEmail({
                email: user?.account_email,
                subject: "Confirm your email",
                message: message,
                source: "account@vendgram.co",
            });

            const { account_email, hasComplianceApproved, hasCompliance } =
                user;

            const data = {
                account_email,
                hasComplianceApproved,
                hasCompliance,
            };
            const resmsg = "User Registration Successful";
            respond(res, data, resmsg, 200, true);
        }
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};
