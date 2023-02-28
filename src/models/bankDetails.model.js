const mongoose = require("mongoose");

const BankDetailsSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        accountName: {
            type: String,
            required: true
        },
        accountNumber: {
            type: String,
            required: true,
            unique: true
        },
        bankName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("BankDetails", BankDetailsSchema);
