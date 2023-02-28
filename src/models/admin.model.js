const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const AdminSchema = mongoose.Schema(
    {
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        admin_email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
        },
        admin_password: {
            type: String,
            select: false,
            required: true,
        },
        admin_pin: {
            type: String,
            minlength: 3,
            maxlength: 100,
            select: false,
            required: true,
        },
        signature: String,
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
AdminSchema.methods.genSignedToken = function () {
    const token = jwt.sign({ id: this._id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRE,
    });
    return token;
};

// Generate and hash resetpassword token
AdminSchema.methods.genResetPasswordToken = function () {
    // Generate token
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to setPasswordToken field
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetPasswordToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 86400000;

    return resetPasswordToken;
};

// Compare password with hashed password in database
AdminSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.account_password);
};

module.exports = mongoose.model("Admin", AdminSchema);
