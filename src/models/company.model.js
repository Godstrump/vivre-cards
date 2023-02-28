const mongoose = require("mongoose");

const CompanySchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        //percentage of stake ownned
        stakeOwned: {
            type: String,
            required: false,
        },
        //How did you learn about us
        mediaAwareness: {
            type: String,
            required: false,
        },
        company_name: {
            type: String,
            required: true,
            unique: true,
        },
        company_sector: {
            type: String,
            required: true,
        },
        //Is business incorporated
        isIncorporated: {
            type: Boolean,
            required: false,
        },
        //is it US Registered
        usRegisted: {
            type: Boolean,
            required: false,
        },
        utilityAmount: {
            type: Number,
            required: false,
        },
        //Business Registration Number
        ein: {
            type: String,
            required: true,
            unique: true,
        },
        businessAddress: {
            type: String,
            required: true,
        },
        //Proof of address
        addressProof: {
            type: String,
            required: true,
        },
        documentId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model("Company", CompanySchema);
