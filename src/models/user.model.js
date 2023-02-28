const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../config/config")

const AccountStatus = Object.freeze({
    active: 'ACTIVE',
    suspended: 'SUSPENDED',
})

const AccountSchema = mongoose.Schema(
    {
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        account_email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
        },
        account_number: {
            type: String,
            unique: true
        },
        account_name: String,
        brexEmail: {
            type: String,
            unique: true
        },
        phone_number: {
            type: String,
            unique: true
        },
        country: {
            type: String,
        },
        hasCompliance: {
            type: Boolean,
            default: false,
        },
        hasComplianceApproved: {
            type: Boolean,
            default: false,
        },
        hasComplianceError: {
            type: Boolean,
            default: false,
        },
        complianceErrors: {
            type: Object,
        },
        account_password: {
            type: String,
            select: false,
        },
        otp: {
            type: String,
            default: '',
            select: false
        },
        account_pin: {
            type: String,
            minlength: 3,
            maxlength: 100,
        },
        brexId: {
            type: String,
            unique: true
        },
        authyId: {
            type: String,
        },
        is_activated: {
            type: Boolean, //This is active if the user email has been verified
            default: false,
        },
        isAccountActive: {
            type: String, //This is active if the user account is active or suspended
            enum: Object.values(AccountStatus),
            default: AccountStatus.active
        },
        token: {
            type: String,
            select: false
        },
        signature: String,
        emailVerificationToken: String,
        emailVerificationDate: Date,

        resetPasswordToken: String,
        resetPasswordExpire: Date,
        photo: {
            type: String,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

// Generate signed JWT and return
AccountSchema.methods.genSignedToken = function () {
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = currentTime + (30 * 60);
    const token = jwt.sign({ id: this._id }, env.access_token, {
        expiresIn: expiryTime,
    });
    return token;
};

// Generate and hash email verification token
AccountSchema.methods.generateEmailVerificationToken = function () {
    // Generate token
    const emailVerificationToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to emailVerificationToken field
    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(emailVerificationToken)
        .digest("hex");

    return emailVerificationToken;
};

// Generate and hash resetpassword token
AccountSchema.methods.genResetPasswordToken = function () {
    // Generate token
    let resetPasswordToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to setPasswordToken field
    resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetPasswordToken)
        .digest("hex");
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = new Date(Date.now() + 3600000);
    this.resetPasswordExpire.setHours(this.resetPasswordExpire.getHours() + 1);
    return resetPasswordToken;
};

// Compare user password with hashed password in database
AccountSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.account_password);
};

module.exports = mongoose.model("User", AccountSchema);
